import { createClient } from './supabase/server';
import { localMediaStore, type MediaStore } from './media-storage';
import { SupabaseMediaStore } from './stores/supabase-media-store';
import { StoreConfigurationError, resolveStoreMode, type StoreMode } from './project-store';

/**
 * Which media backend serves this request.
 *
 * Driven by the same PROJECT_STORE variable as the project store, on purpose: documents
 * in Postgres with images on an ephemeral disk is a configuration that looks fine for a
 * day and then serves broken images forever. One switch cannot be half-set.
 */
export interface ResolvedMediaStore {
  store: MediaStore;
  mode: StoreMode;
}

export async function resolveMediaStore(): Promise<ResolvedMediaStore> {
  const mode = resolveStoreMode();

  if (mode === 'file') {
    return { store: localMediaStore, mode };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new StoreConfigurationError('אין חיבור פעיל למערכת. יש להתחבר מחדש.');
  }

  return { store: new SupabaseMediaStore(supabase, data.user.id), mode };
}
