import { createBrowserClient } from '@supabase/ssr';
import { supabaseEnv } from './env';

/**
 * Supabase client for Client Components.
 *
 * Cheap to call from anywhere: `createBrowserClient` caches its instance per
 * url + key pair, so repeated calls across components share one client and one
 * realtime connection. Cookie handling is the browser's own, which is what keeps this
 * client's session in step with the server one.
 *
 * Note the name collision with lib/client.ts, the editor's fetch layer — that file is
 * `@/lib/client`, this one is `@/lib/supabase/client`.
 */
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
