-- Segevision Platform — projects table.
--
-- The whole project document lives in `project_data` jsonb, exactly as the Zod schema
-- in @segevision/renderer produces it. The scalar columns beside it are a *projection*
-- of that document, not a second source of truth: they exist so the dashboard listing
-- is one cheap query instead of reading every document, and so slug uniqueness and
-- status validity can be enforced by the database. SupabaseProjectStore writes both
-- from the same validated object, so they cannot drift.
--
-- Keeping the document whole is what makes the schema future-proof: adding a content
-- field in the renderer needs no SQL migration here.

create table if not exists public.projects (
  id             text        primary key,
  owner_id       uuid        not null references auth.users (id) on delete cascade,
  name           text        not null,
  slug           text        not null,
  status         text        not null default 'draft',
  project_data   jsonb       not null,
  schema_version integer     not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- Mirrors statusSchema in packages/renderer/src/schema.ts. A status the editor
  -- cannot produce is a bug, and the database should refuse it rather than store it.
  constraint projects_status_check check (status in ('draft', 'review', 'published', 'archived')),

  -- Mirrors the slug regex in projectSchema. Slugs end up in URLs, so the shape is
  -- enforced at rest and not only in the form that happened to create the row.
  constraint projects_slug_format check (slug ~ '^[a-z0-9-]+$'),

  -- id is used as a storage path segment and as a filesystem name during migration.
  constraint projects_id_format check (id ~ '^[A-Za-z0-9_-]+$'),

  constraint projects_schema_version_positive check (schema_version > 0)
);

comment on table  public.projects is 'Client website projects. project_data holds the full renderer document; the other columns are a projection of it.';
comment on column public.projects.project_data is 'Complete Project document as validated by projectSchema in @segevision/renderer.';
comment on column public.projects.updated_at is 'Kept identical to project_data->>''updatedAt'' by SupabaseProjectStore. Deliberately not a now() trigger, so the timestamp the editor shows and the timestamp the row sorts by are the same value.';

-- One slug per owner. This is the constraint that stops "duplicate project" from
-- quietly producing two projects that would deploy to the same URL.
create unique index if not exists projects_owner_slug_key
  on public.projects (owner_id, slug);

-- The dashboard's only listing query: own projects, newest first.
create index if not exists projects_owner_updated_idx
  on public.projects (owner_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is the actual authorisation boundary. The API routes also check the session,
-- but that check is a courtesy for error messages: even a request that got past the
-- routes cannot read or write another owner's row.

alter table public.projects enable row level security;

-- Supabase grants table privileges to `anon` and `authenticated` by default. `anon`
-- has no business here at all, so the grant is removed rather than relying on the
-- absence of a policy.
revoke all on public.projects from anon;
grant select, insert, update, delete on public.projects to authenticated;

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own
  on public.projects
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own
  on public.projects
  for insert
  to authenticated
  with check (owner_id = auth.uid());

-- USING controls which rows may be targeted, WITH CHECK controls what they may become.
-- Both are required: without WITH CHECK, an owner could hand their project to someone
-- else by updating owner_id.
drop policy if exists projects_update_own on public.projects;
create policy projects_update_own
  on public.projects
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own
  on public.projects
  for delete
  to authenticated
  using (owner_id = auth.uid());
