-- rates.sql — monthly FPPA/FPPAS/PPAC rates served to the site without a code redeploy.
--
-- SETUP: Supabase dashboard → SQL Editor → paste this file → Run. (Idempotent.)
--
-- The client (js/rates.js) reads this table anonymously at page load and merges the rows
-- into the hardcoded tables in js/tariffs/fppa.js (remote rows win on conflict). The
-- hardcoded values remain the offline fallback, so the site works fully without this table.
--
-- ADDING A MONTH (dashboard → Table Editor → fppa_rates → Insert row):
--   scope     'state' (one rate for every DISCOM in the state, e.g. UPPCL) or 'discom'
--   key       state name exactly as in the tariff files ("Uttar Pradesh") or discom id ("brpl")
--   from_date / to_date   inclusive billing-date window; leave to_date NULL for open-ended
--   mode      'percent' (% of fixed + energy charges) or 'per_unit' (₹/unit)
--   rate      numeric; negative = consumer credit (e.g. -1.52)
--   label     shown in the FPPA source line, e.g. 'Aug 2026 FPPAS'
--   source    provenance, e.g. 'UPPCL monthly FPPAS notice (UPERC MYT Reg. 2025)'

create table if not exists public.fppa_rates (
  id         uuid primary key default gen_random_uuid(),
  scope      text not null check (scope in ('discom', 'state')),
  key        text not null,
  from_date  date not null,
  to_date    date,
  mode       text not null default 'percent' check (mode in ('percent', 'per_unit')),
  rate       numeric not null,
  label      text not null,
  source     text not null default '',
  created_at timestamptz not null default now(),
  unique (scope, key, from_date)
);

alter table public.fppa_rates enable row level security;

-- Anyone (anon) may read; writes only via the dashboard / service role (no anon policy).
drop policy if exists "rates are public" on public.fppa_rates;
create policy "rates are public" on public.fppa_rates
  for select using (true);
