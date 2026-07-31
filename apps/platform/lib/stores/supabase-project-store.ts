import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import {
  migrateProject,
  parseProject,
  type Project,
  type ProjectStatus,
  type ProjectSummary,
  type TemplateId,
} from '@segevision/renderer';
import type { ProjectStore } from '../storage';

/**
 * Project storage backed by Postgres.
 *
 * Satisfies the same five-method interface as FileProjectStore, so the API routes, the
 * editor and the renderer are untouched by the move.
 *
 * Two things are true of every method here and are the reason the class takes a client
 * rather than creating one:
 *
 *   * The client carries the caller's session, so Row Level Security is what decides
 *     which rows are visible. Nothing in this file filters by owner_id on reads — if a
 *     policy were dropped, queries would return nothing rather than everything.
 *   * A store instance is therefore request-scoped. Never cache one in a module.
 */

/** Shape of the projection selected for the dashboard listing. */
interface SummaryRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
  industry: string | null;
  template: string | null;
}

const SUMMARY_SELECT =
  'id,name,slug,status,created_at,updated_at,industry:project_data->>industry,template:project_data->>template';

/**
 * Turns a Postgrest failure into something a Hebrew UI can show.
 *
 * Anything unrecognised keeps its original message rather than being flattened into a
 * generic "error": a staging environment where every failure reads the same is a
 * staging environment nobody can debug.
 */
function toDomainError(error: PostgrestError, fallback: string): Error {
  if (error.code === '23505') {
    if (error.message.includes('projects_owner_slug_key')) {
      return new Error('כבר קיים פרויקט עם אותה כתובת (slug). יש לבחור כתובת אחרת.');
    }
    return new Error('כבר קיים פרויקט עם המזהה הזה');
  }
  if (error.code === '23503') {
    return new Error('המשתמש המחובר אינו קיים במערכת. יש להתחבר מחדש.');
  }
  if (error.code === '42501' || error.code === 'PGRST301') {
    return new Error('אין הרשאה לפעולה הזאת. יש להתחבר מחדש.');
  }
  // `.single()` found no row. Reachable only if the project was deleted between the
  // route's existence check and the write.
  if (error.code === 'PGRST116') {
    return new Error('הפרויקט לא נמצא');
  }
  return new Error(`${fallback}: ${error.message}`);
}

export class SupabaseProjectStore implements ProjectStore {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly ownerId: string,
  ) {}

  /**
   * The dashboard listing.
   *
   * Selects the projection columns plus two values read out of the document with `->>`,
   * so a list of twenty projects is one row set of eight small fields rather than twenty
   * full documents. `industry` and `template` are not columns because they are not
   * constraints — the document remains their only source of truth.
   */
  async list(): Promise<ProjectSummary[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(SUMMARY_SELECT)
      .order('updated_at', { ascending: false });

    if (error) throw toDomainError(error, 'טעינת רשימת הפרויקטים נכשלה');

    return (data as unknown as SummaryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      industry: row.industry ?? '',
      // A row that violated the check constraint cannot exist, so the cast is a
      // statement about the constraint rather than a hope about the data.
      template: (row.template ?? 'medical') as TemplateId,
      status: row.status as ProjectStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async get(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('project_data')
      .eq('id', id)
      .maybeSingle();

    if (error) throw toDomainError(error, 'טעינת הפרויקט נכשלה');
    if (!data) return null;

    // migrateProject throws MigrationError on a document from a newer, unknown schema.
    // That propagates on purpose: the route turns it into a real explanation instead of
    // a misleading "project not found".
    const { project, migrated } = migrateProject((data as { project_data: unknown }).project_data);

    if (migrated) {
      // Carrying the upgrade forward keeps every later read cheap. Postgres keeps the
      // pre-migration value recoverable through PITR, which is why there is no explicit
      // backup step here as there is in the file store.
      //
      // A failure to persist must not fail the read — the caller already has a valid
      // migrated document in hand, and the next read will simply try again.
      await this.write(id, project).catch(() => undefined);
    }

    return project;
  }

  async create(project: Project): Promise<Project> {
    const validated = parseProject(project);

    const { data, error } = await this.supabase
      .from('projects')
      .insert(this.toRow(validated))
      .select('project_data')
      .single();

    if (error) throw toDomainError(error, 'יצירת הפרויקט נכשלה');
    return (data as { project_data: Project }).project_data;
  }

  async update(id: string, project: Project): Promise<Project> {
    // Same stamping rule as the file store: the id in the URL wins over the id in the
    // body, and every save advances updatedAt.
    const validated = parseProject({ ...project, id, updatedAt: new Date().toISOString() });

    const { data, error } = await this.supabase
      .from('projects')
      .update(this.toRow(validated))
      .eq('id', id)
      .select('project_data')
      .single();

    if (error) throw toDomainError(error, 'שמירת הפרויקט נכשלה');
    return (data as { project_data: Project }).project_data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('projects').delete().eq('id', id);
    // A delete that matched nothing is not an error — the row is gone either way. Only a
    // real failure (connection, permission) is worth reporting.
    if (error) throw toDomainError(error, 'מחיקת הפרויקט נכשלה');
  }

  /** Shared by create and the migrate-on-read path. */
  private async write(id: string, project: Project): Promise<void> {
    const { error } = await this.supabase.from('projects').update(this.toRow(project)).eq('id', id);
    if (error) throw toDomainError(error, 'עדכון הפרויקט נכשל');
  }

  /**
   * The single place the document is projected onto columns.
   *
   * owner_id is written from the session, never from the request body — a client that
   * sends someone else's owner_id is ignored here and would be rejected by the RLS
   * WITH CHECK even if it were not.
   */
  private toRow(project: Project) {
    return {
      id: project.id,
      owner_id: this.ownerId,
      name: project.name,
      slug: project.slug,
      status: project.status,
      project_data: project,
      schema_version: project.schemaVersion,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }
}
