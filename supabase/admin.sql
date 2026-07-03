-- ═══════════════════════════════════════════════════════════════════════════
-- TheDiscomBill — Admin console backend (run AFTER schema.sql)
-- Dashboard → SQL Editor → New query → paste everything → Run.
--
-- What it adds:
--   'admin' as a third profiles.role (user | expert | admin)
--   is_admin() helper (mirrors is_expert() in schema.sql)
--   Four RPCs the /admin/ page calls with the normal anon key. Each one is
--   SECURITY DEFINER (runs as postgres, so it may touch auth.users) and
--   re-checks is_admin() server-side — a non-admin calling them gets an error,
--   so nothing here weakens RLS.
--
-- FINALLY: promote your own account at the bottom (it must have signed up
-- through the site first).
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Allow the third role. Existing rows ('user'/'expert') are unaffected.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'expert', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── List every account (id, email, name, role) ───────────────────────────────
-- Email lives in auth.users, which the client can never read directly; this is
-- the only sanctioned window into it, and only for admins.
create or replace function public.admin_list_users()
returns table (id uuid, email text, full_name text, role text, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  return query
    select u.id, u.email::text, p.full_name, p.role, p.created_at
    from auth.users u
    join public.profiles p on p.id = u.id
    order by p.created_at desc;
end;
$$;

-- ── Create a user (email confirmed, ready to sign in) ────────────────────────
-- Same auth.users + auth.identities recipe as seed-dummy-accounts.sql; the
-- on_auth_user_created trigger makes the profiles row in the same transaction.
create or replace function public.admin_create_user(
  p_email text, p_password text, p_full_name text, p_role text default 'user'
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_role not in ('user', 'expert') then
    raise exception 'role must be user or expert';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'password must be at least 6 characters';
  end if;
  if exists (select 1 from auth.users u where u.email = lower(p_email)) then
    raise exception 'an account with this email already exists';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
    lower(p_email), crypt(p_password, gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', coalesce(p_full_name, '')),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), new_id, new_id::text,
    jsonb_build_object('sub', new_id::text, 'email', lower(p_email)),
    'email', now(), now(), now()
  );

  update public.profiles set role = p_role where id = new_id;
  return new_id;
end;
$$;

-- ── Switch a user ↔ expert ───────────────────────────────────────────────────
-- Admin accounts can't be re-roled here (and you can't demote yourself), so an
-- admin can never lock the console by accident.
create or replace function public.admin_set_role(p_user_id uuid, p_role text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_role not in ('user', 'expert') then
    raise exception 'role must be user or expert';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'you cannot change your own role';
  end if;
  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'cannot change another admin''s role here';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

-- ── Delete a user ────────────────────────────────────────────────────────────
-- Removing the auth.users row cascades to profiles → complaints → files →
-- messages (see the FKs in schema.sql). Uploaded Storage objects are left
-- behind; clean those from Dashboard → Storage if needed.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'you cannot delete your own account';
  end if;
  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'cannot delete another admin';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

-- Only signed-in users may even attempt the RPCs (they still fail without the
-- admin role); anonymous visitors can't touch them.
revoke execute on function public.admin_list_users()                       from anon, public;
revoke execute on function public.admin_create_user(text, text, text, text) from anon, public;
revoke execute on function public.admin_set_role(uuid, text)               from anon, public;
revoke execute on function public.admin_delete_user(uuid)                  from anon, public;
grant  execute on function public.admin_list_users()                       to authenticated;
grant  execute on function public.admin_create_user(text, text, text, text) to authenticated;
grant  execute on function public.admin_set_role(uuid, text)               to authenticated;
grant  execute on function public.admin_delete_user(uuid)                  to authenticated;

-- ── Make yourself the admin ──────────────────────────────────────────────────
-- The account must already exist (sign up on the site first), then run:
update public.profiles set role = 'admin'
where id in (select id from auth.users where email = 'navinbhaskariitkgp@gmail.com');
