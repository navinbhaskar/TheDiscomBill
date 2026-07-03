-- ═══════════════════════════════════════════════════════════════════════════
-- TheDiscomBill — chat attachments (run AFTER schema.sql)
-- Dashboard → SQL Editor → New query → paste → Run.
--
-- Lets both sides of a case chat send files:
--   messages grows nullable file_path / file_name / file_size columns
--   (a message is text, an attachment, or both — body stays not null, '')
--   a storage read policy so BOTH participants can open chat files.
--
-- Uploads reuse the existing 'complaint-docs' bucket and its "upload own docs"
-- policy: every uploader writes into their own <uid>/<complaint_id>/ folder,
-- experts included. The original read policy only covered the consumer's
-- folder (owner or any expert); the new one grants the complaint's PARTICIPANTS
-- access by matching the complaint id in the path's second segment — which is
-- how existing uploads are laid out too.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.messages
  add column if not exists file_path text,
  add column if not exists file_name text,
  add column if not exists file_size bigint;

drop policy if exists "participants read chat docs" on storage.objects;
create policy "participants read chat docs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'complaint-docs'
    and exists (
      select 1 from public.complaints c
      where c.id::text = (storage.foldername(name))[2]
        and (c.user_id = auth.uid() or c.expert_id = auth.uid())
    )
  );
