-- surcharge-rates.sql — the surcharge rate model, widened.
--
-- SUPERSEDES the 10-column public.fppa_rates in rates.sql. Idempotent; safe to re-run.
-- Apply: Supabase dashboard -> SQL Editor -> paste -> Run.
--
-- WHY THIS EXISTS
-- fppa_rates could record WHAT the rate was but almost nothing about WHERE IT CAME FROM or
-- WHAT IT APPLIES TO. Two consequences, both real:
--
--  1. Provenance lived only in a free-text `source` column, so "verified against the order"
--     and "read off a news report" were indistinguishable. A tariff site cannot afford that.
--
--  2. `mode` allowed only 'percent' and 'per_unit', but js/engine.js computes a THIRD base,
--     percent_total (percent-of-total additionally including wheeling and FAC). The old CHECK
--     rejected it, and js/rates.js coerced anything not 'per_unit' into 'percent' -- so a
--     surcharge on the wider base silently became one on the narrower base whenever the rate
--     came from this table instead of the bundled fallback. Wrong money, no error. billing_base
--     now carries that explicitly and the CHECK admits every base the engine implements.

create table if not exists public.surcharge_rates (
  id                  uuid primary key default gen_random_uuid(),

  -- WHO IT APPLIES TO ------------------------------------------------------
  -- state is always set. discom NULL = every DISCOM in that state; a row naming a discom
  -- overrides the state-wide row for the same window (Delhi notifies per DISCOM, UP does not).
  state               text not null,
  discom              text,
  consumer_category   text not null default 'all',

  -- WHAT THE CHARGE IS -----------------------------------------------------
  charge_code         text not null check (charge_code in ('FPPA','FPPAS','PPAC','FAC','FPPCA','REGULATORY_SURCHARGE')),
  display_name        text not null,

  -- HOW MUCH ---------------------------------------------------------------
  -- rate is signed: negative is a consumer credit, which UP issues most months.
  rate                numeric not null,
  rate_type           text not null check (rate_type in ('percentage','per_unit')),
  unit                text not null check (unit in ('%','INR/kWh')),
  -- The base the percentage applies to. Ignored when rate_type = 'per_unit'.
  -- Mirrors js/engine.js exactly:
  --   energy_and_fixed -> fixed + energy + excess demand + ToD + minimum-charge top-up
  --   total            -> the above PLUS wheeling and FAC
  billing_base        text check (billing_base in ('energy_and_fixed','total','energy_only')),
  -- Some states cap the surcharge (UP: 10% of the base). Null = uncapped.
  cap_percent         numeric,
  previous_rate       numeric,

  -- WHEN -------------------------------------------------------------------
  applicable_from     date not null,
  applicable_to       date,                 -- null = still in force
  billing_month       text,                 -- 'Aug 2026', for notices issued per billing month

  -- PROVENANCE -------------------------------------------------------------
  regulator           text,                 -- UPERC, DERC, RERC, ...
  order_date          date,
  source_url          text,
  source_document     text,                 -- 'order' | 'circular' | 'tariff schedule' | 'notice'
  -- 'verified'   = read off the linked official document
  -- 'reported'   = credible secondary reporting, no order URL held
  -- 'estimated'  = modelled from a rule, not a published figure
  -- Never default to 'verified'. An unsourced row must say so.
  verification_status text not null default 'unverified'
                        check (verification_status in ('verified','reported','estimated','unverified')),
  verified_at         timestamptz,
  notes               text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- A percentage row must name its base; a per-unit row must not carry one.
  constraint base_required_for_percentage check (
    (rate_type = 'percentage' and billing_base is not null) or
    (rate_type = 'per_unit'   and billing_base is null)
  ),
  -- Unit has to agree with the type, or the display line lies about the figure.
  constraint unit_matches_type check (
    (rate_type = 'percentage' and unit = '%') or
    (rate_type = 'per_unit'   and unit = 'INR/kWh')
  ),
  -- A closed window cannot end before it starts.
  constraint window_ordered check (applicable_to is null or applicable_to >= applicable_from),
  -- Anything claiming verification must show its work.
  constraint verified_needs_evidence check (
    verification_status <> 'verified' or (source_url is not null and verified_at is not null)
  )
);

-- One rate per charge, per audience, per window opening.
create unique index if not exists surcharge_rates_window
  on public.surcharge_rates (state, coalesce(discom,''), charge_code, consumer_category, applicable_from);

-- The lookup the client actually makes: "what applies to this DISCOM on this date".
create index if not exists surcharge_rates_lookup
  on public.surcharge_rates (state, discom, applicable_from desc);

create or replace function public.touch_surcharge_rates() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists surcharge_rates_touch on public.surcharge_rates;
create trigger surcharge_rates_touch before update on public.surcharge_rates
  for each row execute function public.touch_surcharge_rates();

alter table public.surcharge_rates enable row level security;

-- Read-only to the world; writes via dashboard / service role only.
drop policy if exists "surcharge rates are public" on public.surcharge_rates;
create policy "surcharge rates are public" on public.surcharge_rates
  for select using (true);
