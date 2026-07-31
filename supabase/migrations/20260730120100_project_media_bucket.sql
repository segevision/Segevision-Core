-- Segevision Platform — project media bucket.
--
-- Private bucket. Nothing in it is world-readable: the browser never talks to Supabase
-- Storage directly, it fetches /api/media/<key>, and that route streams the object
-- using the caller's own session. Two consequences worth stating, because they are the
-- reason this design was chosen over public URLs or signed URLs:
--
--   * The `src` stored inside a project document stays valid forever. A signed URL
--     expires, and an expired URL baked into a saved document is silent data rot.
--   * Access is revoked the moment a session is, with no bucket-wide toggle to get
--     wrong.
--
-- Path convention: <owner-id>/<project-id>/<slot>/<uuid>.<ext>
-- The first segment is the owner uuid, which is what every policy below keys on.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  false,
  8388608, -- 8 MiB, same limit the upload route enforces (MAX_UPLOAD_BYTES).
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage RLS
-- ---------------------------------------------------------------------------
-- storage.objects already has RLS enabled by Supabase; only the policies are ours.
-- Every one of them is scoped twice: to this bucket, and to a name whose first path
-- segment is the caller's own uuid. An object under someone else's uuid is invisible
-- and untouchable, which is what makes the owner folder a real boundary rather than a
-- naming convention.

drop policy if exists project_media_select_own on storage.objects;
create policy project_media_select_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists project_media_insert_own on storage.objects;
create policy project_media_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Replacing an image is an upsert, which Postgres sees as an update on an existing
-- object; without this policy "replace photo" fails while "add photo" works.
drop policy if exists project_media_update_own on storage.objects;
create policy project_media_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists project_media_delete_own on storage.objects;
create policy project_media_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
