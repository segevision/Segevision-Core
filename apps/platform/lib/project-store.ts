import type { User } from '@supabase/supabase-js';
import { createClient } from './supabase/server';
import { fileProjectStore, type ProjectStore } from './storage';
import { SupabaseProjectStore } from './stores/supabase-project-store';
import { StoreConfigurationError, resolveStoreMode, type StoreMode } from './store-mode';

/**
 * Builds the project store for this request.
 *
 * The decision of *which* backend lives in ./store-mode.ts; this file only carries it out.
 */

export { StoreConfigurationError, resolveStoreMode };
export type { StoreMode };

export interface ResolvedStore {
  store: ProjectStore;
  mode: StoreMode;
  /** Null in file mode, which has no concept of an owner. */
  user: User | null;
}

/**
 * In supabase mode the caller must already be authenticated — the store needs an owner uuid
 * to stamp on inserts, and RLS needs a session to evaluate. Routes check the session first
 * and return 401, so reaching the throw below means a route forgot to.
 */
export async function resolveProjectStore(): Promise<ResolvedStore> {
  const mode = resolveStoreMode();

  if (mode === 'file') {
    return { store: fileProjectStore, mode, user: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new StoreConfigurationError('אין חיבור פעיל למערכת. יש להתחבר מחדש.');
  }

  return { store: new SupabaseProjectStore(supabase, data.user.id), mode, user: data.user };
}
