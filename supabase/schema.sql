-- ═══════════════════════════════════════════════════════════════════════════
-- TheDiscomBill — Bill Review backend (Supabase)
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste everything → Run.
--
-- What it creates:
--   profiles         one row per signed-up user (role: 'user' | 'expert')
--   complaints       the complaint pool (pending → assigned → resolved)
--   complaint_files  metadata for uploaded documents (files live in Storage)
--   messages         chat between the consumer and the assigned expert
--   Storage bucket   'complaint-docs' (private; access via RLS policies)
--
-- To promote someone to expert after they sign up:
--   Dashboard → Table Editor → profiles → set their role to 'expert'
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       text not null default 'user' check (role in ('user', 'expert')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by policies below. SECURITY DEFINER so it can read profiles
-- without tripping over profiles' own RLS.
create or replace function public.is_expert()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'expert'
  );
$$;

-- ── Complaints ───────────────────────────────────────────────────────────────
create table if not exists public.complaints (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  expert_id   uuid references public.profiles(id),
  state       text not null,
  discom      text not null,
  subject     text not null,
  description text not null default '',
  status      text not null default 'pending' check (status in ('pending', 'assigned', 'resolved')),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  resolved_at timestamptz
);

create index if not exists complaints_user_idx   on public.complaints (user_id, created_at desc);
create index if not exists complaints_pool_idx   on public.complaints (status, created_at);
create index if not exists complaints_expert_idx on public.complaints (expert_id, created_at desc);

-- ── Complaint files (metadata; binary lives in Storage) ─────────────────────
create table if not exists public.complaint_files (
  id           uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  name         text not null,
  path         text not null,          -- Storage object path inside 'complaint-docs'
  size         bigint not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists complaint_files_idx on public.complaint_files (complaint_id);

-- ── Messages (chat) ──────────────────────────────────────────────────────────
create table if not exists public.messages (
  id           bigint generated always as identity primary key,
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  sender_id    uuid not null references public.profiles(id),
  body         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists messages_thread_idx on public.messages (complaint_id, id);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.complaints      enable row level security;
alter table public.complaint_files enable row level security;
alter table public.messages        enable row level security;

-- profiles: any signed-in user may read names/roles (needed to label chat
-- messages); rows are only created by the signup trigger, never from the client.
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles
  for select to authenticated using (true);

-- complaints
drop policy if exists "own complaints" on public.complaints;
create policy "own complaints" on public.complaints
  for select to authenticated
  using (user_id = auth.uid() or public.is_expert());

drop policy if exists "file own complaint" on public.complaints;
create policy "file own complaint" on public.complaints
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and expert_id is null);

-- Experts may claim an unassigned complaint (must assign it to themselves)
-- and update cases they own (e.g. mark resolved).
drop policy if exists "expert manages case" on public.complaints;
create policy "expert manages case" on public.complaints
  for update to authenticated
  using (public.is_expert() and (expert_id is null or expert_id = auth.uid()))
  with check (expert_id = auth.uid());

-- complaint_files: visible to the complaint participants; only the owner
-- attaches files.
drop policy if exists "files readable by participants" on public.complaint_files;
create policy "files readable by participants" on public.complaint_files
  for select to authenticated
  using (exists (
    select 1 from public.complaints c
    where c.id = complaint_id
      and (c.user_id = auth.uid() or public.is_expert())
  ));

drop policy if exists "owner attaches files" on public.complaint_files;
create policy "owner attaches files" on public.complaint_files
  for insert to authenticated
  with check (exists (
    select 1 from public.complaints c
    where c.id = complaint_id and c.user_id = auth.uid()
  ));

-- messages: only the consumer and the assigned expert can read/write a thread.
drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.complaints c
    where c.id = complaint_id
      and (c.user_id = auth.uid() or c.expert_id = auth.uid())
  ));

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.complaints c
      where c.id = complaint_id
        and c.status = 'assigned'
        and (c.user_id = auth.uid() or c.expert_id = auth.uid())
    )
  );

-- ── Realtime (live chat) ─────────────────────────────────────────────────────
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

-- ── Storage bucket for uploaded documents ────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-docs', 'complaint-docs', false,
  10485760,  -- 10 MB per file
  array['image/png','image/jpeg','image/webp','application/pdf']
)
on conflict (id) do nothing;

-- Consumers upload into their own folder: <user_id>/<complaint_id>/<filename>
drop policy if exists "upload own docs" on storage.objects;
create policy "upload own docs" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'complaint-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners and experts can read documents (experts need them to examine bills).
drop policy if exists "read complaint docs" on storage.objects;
create policy "read complaint docs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'complaint-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_expert())
  );
