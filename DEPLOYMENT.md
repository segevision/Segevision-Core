# Deployment Readiness — Segevision Platform

Status of `@segevision/platform` (the internal studio at `localhost:3500`) with
respect to hosting it somewhere other than a laptop. Written against the real
repository state; every "verified" line below was executed, not assumed.

Classification used throughout:

| Tag | Meaning |
| --- | --- |
| **READY** | Safe as-is. |
| **STAGING-BLOCKER** | Must be fixed before a private, password-protected staging URL. |
| **PRODUCTION-BLOCKER** | Must be fixed before any public or client-facing URL. |
| **CAN WAIT** | Real, but not on the critical path. |

---

## Phase 2 — Readiness audit

### 2.1 FileProjectStore — `apps/platform/lib/storage.ts`

| Item | Class | Detail |
| --- | --- | --- |
| Interface design | **READY** | `ProjectStore` is a clean five-method seam (`list/get/create/update/remove`). A Supabase implementation is a new class, not a rewrite. This is the single best architectural decision in the codebase. |
| Data directory resolution | **READY** *(fixed this session)* | Was `path.join(process.cwd(), '..', '..', '.data')` — correct only when launched from `apps/platform`. Now anchored to the workspace root via `lib/data-root.ts`. |
| Writes to local disk | **PRODUCTION-BLOCKER** | Vercel's serverless filesystem is read-only apart from `/tmp`, and `/tmp` is per-instance and ephemeral. Every save would either throw or vanish. This is the reason Phase 3 exists. |
| No concurrency control | **STAGING-BLOCKER** | `update()` writes the whole document with last-write-wins. Two editor tabs (or two people) silently discard each other's work. No `updatedAt` precondition is checked. |
| No write atomicity | **CAN WAIT** | `writeFile` is not atomic; a crash mid-write truncates the project file. Write-to-temp-then-`rename` is the standard fix. Low probability locally, non-issue once Postgres owns the data. |
| Backup on migration only | **CAN WAIT** | `backupBeforeMigration` is good practice, but ordinary saves are never backed up. Postgres PITR supersedes this. |
| `seedIfEmpty()` on every read | **CAN WAIT** | A `readdir` per request. Deliberate and documented; irrelevant at current scale. |

### 2.2 `.data/projects` — the actual client data

| Item | Class | Detail |
| --- | --- | --- |
| Gitignored | **READY** | `.gitignore` excludes `.data`, so client phone numbers and addresses cannot be committed by accident. |
| **No version control at all** | **STAGING-BLOCKER** | `git rev-parse` fails — this directory is *not a git repository*. There is no history, no branch, no rollback, and no remote. "Rollback strategy" is currently "restore from a `.zip`" (`apps.zip`, `packages.zip` at the repo root are evidence of exactly that). Initialise git before anything else. |
| Unencrypted at rest | **CAN WAIT** | Plain JSON on a laptop disk. Acceptable for internal use; FileVault covers it. |
| Contents verified intact | **READY** | 3 projects + 3 migration backups + 1 media file, byte-identical before and after this session's work. |

### 2.3 Local media storage — `apps/platform/lib/media-storage.ts`

| Item | Class | Detail |
| --- | --- | --- |
| MIME allowlist + 8 MB cap | **READY** | Enforced in both the route and the store. |
| Path traversal | **READY** | `isSafeSegment` rejects `..`; verified — a crafted traversal URL returns 404, not a file. |
| Content-addressed filenames | **READY** | UUID names make the one-year immutable cache header correct. |
| **SVG upload + inline serving** | **STAGING-BLOCKER** | `image/svg+xml` is accepted, then served from `/api/media/...` on the platform's own origin with no `Content-Security-Policy`, no `X-Content-Type-Options: nosniff`, and no `Content-Disposition`. An SVG containing `<script>` is stored XSS against the studio origin. Fix by dropping SVG from `ALLOWED_TYPES`, or serving media from a separate origin with `nosniff` + a sandbox CSP. |
| Unauthenticated `DELETE` | **PRODUCTION-BLOCKER** | Anyone who can reach the URL can delete any project's media. |

### 2.4 Authentication

| Item | Class | Detail |
| --- | --- | --- |
| **None whatsoever** | **PRODUCTION-BLOCKER** | No `middleware.ts`, no session, no cookie check, no bearer token — verified by grep across `app/` and `lib/`. Every route and every API is fully open. Safe only because it is bound to localhost today. The moment this has a public URL, every client project is world-readable and world-deletable. |

### 2.5 API authorization

| Item | Class | Detail |
| --- | --- | --- |
| No ownership model | **PRODUCTION-BLOCKER** | Projects have no `owner_id`. There is no concept of "your" projects, so there is nothing to authorize against yet. Phase 3 introduces it. |
| Input validation | **READY** | Every mutating route parses through Zod (`safeParseProject`) and returns Hebrew 400s with issue detail. Genuinely well done. |
| Id injection | **READY** | `assertSafeId` + Zod. |
| Overwrite-by-POST | **READY** *(fixed this session)* | `POST /api/projects` used to overwrite an existing project silently. Now returns 409; verified against a live server, original file unchanged. |
| Error leakage | **READY** | Route errors return Hebrew messages, not stack traces. The new `error.tsx` only shows raw messages when `NODE_ENV !== 'production'`. |

### 2.6 Environment variables and secrets

| Item | Class | Detail |
| --- | --- | --- |
| No secrets in repo | **READY** | No `.env*` files exist anywhere; the only env vars referenced are `SEGEVISION_DATA_ROOT`, `SEGEVISION_DATA_DIR`, `SEGEVISION_MEDIA_DIR`, and `NODE_ENV`. Clean slate. |
| No `.env.example` | **CAN WAIT** | Should exist once Supabase keys are introduced, so the required set is self-documenting. |

### 2.7 Vercel compatibility

| Item | Class | Detail |
| --- | --- | --- |
| Framework | **READY** | Next 14.2.18 App Router, standard build, no exotic config. `reactStrictMode: true`. |
| Type/lint safety in build | **READY** | `next build` runs real type checking — no `ignoreBuildErrors` escape hatches. |
| `transpilePackages` | **READY** | All eight workspace packages are listed and ship TypeScript source; Vercel handles this natively. |
| Filesystem persistence | **PRODUCTION-BLOCKER** | See 2.1. This is the only true incompatibility. |
| No security headers | **CAN WAIT** | No HSTS/CSP/`nosniff`/frame policy configured. Worth adding in `next.config.mjs` alongside the SVG fix. |
| `/preview` in an iframe | **CAN WAIT** | Confirm framing policy deliberately, since the editor previews inside an iframe. |

### 2.8 Monorepo build settings

| Item | Class | Detail |
| --- | --- | --- |
| Workspace + Turbo | **READY** | `pnpm-workspace.yaml` + `turbo.json` are correct and conventional. |
| Node engine | **CAN WAIT** | `engines.node: ">=18"` is open-ended; local runtime is Node 24. Pin the major on Vercel so local and remote agree. |
| Build cache hygiene | **READY** *(added this session)* | `build` and `dev` share one `.next`. `clean` / `dev:clean` scripts added. |

---

## Phase 3 — Supabase migration plan (design only, not implemented)

The goal is to satisfy the existing `ProjectStore` interface exactly, so that the
editor, the API routes and the renderer are not touched.

### 3.1 Schema

```sql
create table public.projects (
  id          text primary key,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  -- Summary columns are duplicated out of the document purely so list() stays a
  -- cheap indexed query instead of parsing every document.
  name        text        not null,
  slug        text        not null,
  status      text        not null default 'draft',
  template    text        not null,
  industry    text,
  data        jsonb       not null,        -- the whole Project document; Zod stays source of truth
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index projects_owner_slug_idx on public.projects (owner_id, slug);
create index projects_owner_updated_idx on public.projects (owner_id, updated_at desc);
```

Keeping the document in a single `jsonb` column is what makes this a drop-in: the
Zod schema remains the only definition of a project, and adding a content field
never requires a database migration.

### 3.2 Row Level Security

```sql
alter table public.projects enable row level security;

create policy "owner reads"   on public.projects for select using (auth.uid() = owner_id);
create policy "owner inserts" on public.projects for insert with check (auth.uid() = owner_id);
create policy "owner updates" on public.projects for update using (auth.uid() = owner_id);
create policy "owner deletes" on public.projects for delete using (auth.uid() = owner_id);
```

RLS is the real authorization boundary. Server routes must use the **user's**
session client, never the service-role key — the service role bypasses RLS and
would silently reinstate today's "everyone sees everything" behaviour.

### 3.3 Concurrency

Fix the last-write-wins defect during the migration, not after:

```sql
update projects set data = $1, updated_at = now()
where id = $2 and owner_id = auth.uid() and updated_at = $3
```

Zero rows updated ⇒ someone else saved first ⇒ return 409 and let the editor
surface a Hebrew "הפרויקט עודכן במקום אחר" conflict notice.

### 3.4 Storage

- Bucket `project-media`, **private**, one folder per project id.
- Path convention `{{owner_id}}/{{project_id}}/{{uuid}}.{{ext}}`, so a storage RLS
  policy can key off the first path segment.
- `SupabaseMediaStore.save()` uploads and returns a signed URL;
  `read()` disappears entirely because Supabase serves the bytes.
- Drop SVG from the allowlist at the same time (see 2.3).

### 3.5 Data migration of existing `.data` files

One idempotent script, `scripts/migrate-to-supabase.ts`, run locally:

1. Refuse to start unless `git status` is clean and a fresh `.data` tarball exists.
2. `readdir('.data/projects')`, `migrateProject()` each file to the current schema
   version, and `parseProject()` it — a file that fails validation aborts the run
   and is reported by name. No partial migrations.
3. Upsert into Postgres keyed on `id`, stamping `owner_id` with the single studio
   user's uuid.
4. Upload `.data/media/**` to the bucket, then rewrite the `src` of each media
   entry in the document to the new storage path.
5. Re-read every row back, `parseProject()` it again, and diff against the source
   file. Print a per-project ✅/❌ table.
6. **Leave `.data` completely untouched.** It is the rollback.

### 3.6 Backup and rollback

- **Before:** `git init` + first commit (currently impossible — see 2.2), plus a
  timestamped copy of `.data` stored outside the repo.
- **During:** the script is additive only; it never deletes or mutates local files.
- **After:** keep `.data` for at least one month. Enable Supabase PITR on the paid
  tier, or a nightly `pg_dump` on the free tier.
- **Rollback:** revert the one-line export at the bottom of `lib/storage.ts` back to
  `new FileProjectStore()` and redeploy. Because the interface is unchanged, rollback
  is a single-line change — which is precisely why the interface should not be
  "improved" during this migration.

---

## Phase 4 — Staging deployment plan

**Recommended architecture:** Vercel (Next.js) + Supabase (Postgres, Auth, Storage),
private staging URL first, custom domain only after the client-facing flows are signed off.

### 4.1 Vercel project settings

| Setting | Value |
| --- | --- |
| Root Directory | `apps/platform` |
| Include files outside root | **enabled** (required — the app imports eight workspace packages) |
| Framework preset | Next.js |
| Install command | `pnpm install --frozen-lockfile` (run from repo root) |
| Build command | `pnpm --filter @segevision/platform build` |
| Output | `.next` (default — do **not** set `standalone`) |
| Node version | pin to 20 or 22 |

### 4.2 Environment variables

| Name | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | all | Public by design. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | Public by design; RLS is what protects data. |
| `SUPABASE_SERVICE_ROLE_KEY` | **migration script only — never in Vercel** | Bypasses RLS. |
| `SEGEVISION_DATA_ROOT` | unused after Phase 3 | Kept as the local-dev escape hatch. |

### 4.3 Access protection

Use **Vercel Deployment Protection** (Standard Protection / Vercel Authentication) on
the staging project so the URL is not publicly reachable at all. That is a network-level
gate in front of the app and is independent of Supabase Auth inside it — do not treat
either one as a substitute for the other.

### 4.4 Database migrations

Keep SQL in `supabase/migrations/` and apply with the Supabase CLI
(`supabase db push`) against staging first. Never edit schema through the dashboard
UI — an undocumented schema cannot be recreated or reviewed.

### 4.5 Rollback

Vercel keeps every previous deployment; "Promote to Production" on the prior build is
an instant application rollback. Database rollback is the separate, slower path
(PITR or `pg_dump` restore) — which is why schema changes should be additive and
deployed *before* the code that depends on them.

### 4.6 Cost risks

- Vercel Hobby forbids commercial use; a client-facing studio needs **Pro (~$20/user/mo)**.
- Supabase free tier pauses a project after ~1 week of inactivity — unacceptable for a
  staging URL shown to clients. Budget **Pro (~$25/mo)** when it stops being a toy.
- Supabase Storage egress is the line item that grows silently with image-heavy previews.

### 4.7 Security risks (ranked)

1. Deploying **before** authentication exists — total data exposure.
2. Using the service-role key in the deployed app — silently disables RLS.
3. Stored XSS via SVG upload (2.3).
4. Missing security headers.
5. Last-write-wins saves — data loss rather than data leak, but still loss.

---

## Recommended next implementation phase

In order, because each step de-risks the next:

1. `git init`, first commit, private remote. *Nothing else should happen first.*
2. Supabase Auth + `middleware.ts` gate, still on `FileProjectStore`. Proves the auth
   flow in isolation.
3. `SupabaseProjectStore` behind the existing interface, with the `updatedAt`
   precondition; swap the export.
4. `SupabaseMediaStore`; drop SVG; add security headers.
5. Run the migration script; verify; deploy to a protected Vercel staging URL.
