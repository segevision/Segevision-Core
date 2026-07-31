import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { currentUser, unauthorizedJson } from './supabase/auth';
import { StoreConfigurationError, resolveProjectStore } from './project-store';
import { resolveMediaStore } from './media-store';
import type { ProjectStore } from './storage';
import type { MediaStore } from './media-storage';

/**
 * The shared front door for every project and media route.
 *
 * Each route used to open with `projectStore.something()` and trust the caller. Now every
 * one of them has the same three-line preamble — authenticate, resolve the backend,
 * translate infrastructure failures — so it is written once here instead of five times
 * with four subtle differences.
 *
 * The failure translation is the part worth getting right. A misconfigured or unreachable
 * Supabase must produce a 503 that names the problem, never a 200 that wrote to a disk
 * which will not survive the next cold start.
 */

function configurationErrorResponse(cause: StoreConfigurationError): NextResponse {
  // The English detail is for the server log and for us; the Hebrew line is what the
  // editor shows the person who just lost a save.
  console.error('[storage] configuration error:', cause.message);
  return NextResponse.json(
    {
      error: 'החיבור למאגר הנתונים אינו זמין. השינויים לא נשמרו.',
      recovery: 'יש לרענן ולנסות שוב. אם התקלה חוזרת — בדוק את הגדרות Supabase בסביבת ההרצה.',
    },
    { status: 503 },
  );
}

function unexpectedErrorResponse(cause: unknown): NextResponse {
  console.error('[storage] unexpected failure:', cause);
  return NextResponse.json(
    { error: cause instanceof Error ? cause.message : 'הפעולה נכשלה' },
    { status: 500 },
  );
}

/**
 * Runs `handler` with an authenticated user and a project store, or returns the
 * appropriate refusal.
 *
 * A route may still return its own error responses for domain problems — a 404 for a
 * missing project, a 400 for an invalid document. This only owns the failures that are
 * identical everywhere.
 */
export async function withProjectStore(
  handler: (store: ProjectStore, user: User) => Promise<NextResponse>,
): Promise<NextResponse> {
  const user = await currentUser();
  if (!user) return unauthorizedJson();

  try {
    const { store } = await resolveProjectStore();
    return await handler(store, user);
  } catch (cause) {
    if (cause instanceof StoreConfigurationError) return configurationErrorResponse(cause);
    return unexpectedErrorResponse(cause);
  }
}

export async function withMediaStore(
  handler: (store: MediaStore, user: User) => Promise<NextResponse>,
): Promise<NextResponse> {
  const user = await currentUser();
  if (!user) return unauthorizedJson();

  try {
    const { store } = await resolveMediaStore();
    return await handler(store, user);
  } catch (cause) {
    if (cause instanceof StoreConfigurationError) return configurationErrorResponse(cause);
    return unexpectedErrorResponse(cause);
  }
}
