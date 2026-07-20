-- ═══════════════════════════════════════════════════════════════════════════
-- TheDiscomBill — Community + Profile additions
-- Run ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste everything → Run. Safe to re-run (idempotent).
--
-- What it creates:
--   community_posts   public discussion posts (anyone can read, owners manage)
--   RLS policy        lets a signed-in user update their OWN profiles row
--                     (needed by the /profile/ page's "save name" button)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profiles: allow self-service edits (name) ───────────────────────────────
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── Community posts ──────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default '',          -- denormalised display name at post time
  title       text not null check (char_length(title) between 3 and 160),
  body        text not null default '' check (char_length(body) <= 4000),
  created_at  timestamptz not null default now()
);

alter table public.community_posts enable row level security;

-- Everyone (including signed-out visitors) can read the feed.
drop policy if exists "posts readable by all" on public.community_posts;
create policy "posts readable by all" on public.community_posts
  for select using (true);

-- Signed-in users can post as themselves only.
drop policy if exists "post as self" on public.community_posts;
create policy "post as self" on public.community_posts
  for insert with check (auth.uid() = user_id);

-- Owners can delete their own posts.
drop policy if exists "delete own post" on public.community_posts;
create policy "delete own post" on public.community_posts
  for delete using (auth.uid() = user_id);

create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);
