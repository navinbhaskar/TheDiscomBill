-- ═══════════════════════════════════════════════════════════════════════════
-- TheDiscomBill — seed dummy test accounts directly into auth.users
-- Run ONCE in Supabase Dashboard → SQL Editor → New query → paste → Run.
--
-- Creates the 8 accounts from supabase/dummy-accounts.txt with:
--   password: Demo@12345  (bcrypt-hashed via pgcrypto, same as GoTrue)
--   email already confirmed (no confirmation link needed)
--   an auth.identities row so email/password sign-in works
--   a public.profiles row (created by the existing on_auth_user_created
--   trigger — first 5 stay role='user', last 3 are promoted to 'expert' below)
--
-- Safe to re-run: skips any email that already exists in auth.users.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

do $$
declare
  accounts jsonb := '[
    {"name": "Rahul Sharma",  "email": "rahul.sharma.demo@thediscombill.com"},
    {"name": "Priya Verma",   "email": "priya.verma.demo@thediscombill.com"},
    {"name": "Amit Singh",    "email": "amit.singh.demo@thediscombill.com"},
    {"name": "Sneha Iyer",    "email": "sneha.iyer.demo@thediscombill.com"},
    {"name": "Vikram Patel",  "email": "vikram.patel.demo@thediscombill.com"},
    {"name": "Anjali Rao",    "email": "anjali.rao.expert@thediscombill.com"},
    {"name": "Manoj Kumar",   "email": "manoj.kumar.expert@thediscombill.com"},
    {"name": "Deepa Nair",    "email": "deepa.nair.expert@thediscombill.com"}
  ]';
  acc record;
  new_id uuid;
begin
  for acc in select * from jsonb_to_recordset(accounts) as x(name text, email text)
  loop
    if exists (select 1 from auth.users where email = acc.email) then
      continue;
    end if;

    new_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
      acc.email, crypt('Demo@12345', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', acc.name),
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), new_id, new_id::text,
      jsonb_build_object('sub', new_id::text, 'email', acc.email),
      'email', now(), now(), now()
    );
  end loop;
end $$;

-- Force-confirm every dummy account. This fixes any that were created earlier
-- through the normal signup form/REST while "Confirm email" was enabled (they
-- exist but are stuck at email_confirmed_at = null and cannot sign in).
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmation_token = ''
where email in (
  'rahul.sharma.demo@thediscombill.com',
  'priya.verma.demo@thediscombill.com',
  'amit.singh.demo@thediscombill.com',
  'sneha.iyer.demo@thediscombill.com',
  'vikram.patel.demo@thediscombill.com',
  'anjali.rao.expert@thediscombill.com',
  'manoj.kumar.expert@thediscombill.com',
  'deepa.nair.expert@thediscombill.com'
);

-- Backfill profiles rows for any dummy user whose signup trigger didn't fire
-- (e.g. created before schema.sql installed the trigger).
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
where u.email like '%.demo@thediscombill.com'
   or u.email like '%.expert@thediscombill.com'
on conflict (id) do nothing;

-- Promote the 3 expert accounts (profiles rows now exist via the signup trigger)
update public.profiles
set role = 'expert'
where id in (
  select id from auth.users where email in (
    'anjali.rao.expert@thediscombill.com',
    'manoj.kumar.expert@thediscombill.com',
    'deepa.nair.expert@thediscombill.com'
  )
);
