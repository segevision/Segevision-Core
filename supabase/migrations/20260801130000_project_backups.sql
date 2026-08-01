-- Segevision Platform — immutable pre-write backups of project documents.
--
-- WHY THIS EXISTS
-- ---------------
-- SupabaseProjectStore rewrites a project the first time it reads one stored under an
-- older schema. That rewrite is the only place the platform destroys a previous shape of
-- a client's document, and until now it had no explicit backup behind it — it relied on
-- Point-in-Time Recovery, which is a paid feature that may or may not be enabled and
-- cannot be checked from the application.
--
-- A row is written here *before* any migrating write, so the pre-migration document
-- survives independently of PITR, of the migration code, and of the project row itself.
--
-- Deliberately NOT a foreign key to public.projects. A backup whose whole purpose is to
-- outlive a bad write must also outlive a deleted project; a cascade here would delete
-- the evidence at exactly the moment it is needed.

create table if not exists public.project_backups (
  id             uuid        primary key default gen_random_uuid(),
  project_id     text        not null,
  owner_id       uuid        not null references auth.users (id) on delete cascade,
  -- The schema version of the document as stored, i.e. before the migration ran.
  schema_version integer     not null,
  -- Why the backup was taken, e.g. 'migrate:2->3'. Free text on purpose: the set of
  -- reasons will grow, and a constraint here would mean a migration to add one.
  reason         text        not null,
  project_data   jsonb       not null,
  created_at     timestamptz not null default now(),

  constraint project_backups_schema_version_positive check (schema_version > 0)
);

comment on table public.project_backups is
  'Immutable copies of a project document taken immediately before a migrating write. Append-only by policy.';

-- The only query this table serves: the backups of one project, newest first.
create index if not exists project_backups_owner_project_idx
  on public.project_backups (owner_id, project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.project_backups enable row level security;

revoke all on public.project_backups from anon;
-- Select and insert only. No update and no delete policy exists, which is what makes the
-- table append-only for the application: a bug in the platform cannot rewrite or erase a
-- backup, because there is no policy that would permit it. Retention is a deliberate
-- operator action through the SQL editor.
grant select, insert on public.project_backups to authenticated;

drop policy if exists project_backups_select_own on public.project_backups;
create policy project_backups_select_own
  on public.project_backups
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists project_backups_insert_own on public.project_backups;
create policy project_backups_insert_own
  on public.project_backups
  for insert
  to authenticated
  with check (owner_id = auth.uid());
