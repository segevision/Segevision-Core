import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './env';

/**
 * Supabase client for anything that runs on the server: Server Components, Route
 * Handlers and Server Actions.
 *
 * A new client per request, never a module-level singleton — it carries that request's
 * cookies, and sharing one across requests would hand one visitor another's session.
 *
 * `cookies()` is synchronous in Next 14, so this helper takes no arguments and reads
 * the store itself. On a move to Next 15 `cookies()` returns a promise: this becomes
 * `export async function createClient()` with `await cookies()`, and every call site
 * gains an `await`.
 */
export function createClient() {
  const { url, key } = supabaseEnv();
  const cookieStore = cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components are not allowed to write cookies, and there is no way to
          // ask in advance whether this call site may — hence a catch rather than a
          // check. Safe to swallow: a session refreshed during a render is persisted by
          // middleware.ts on the next request. Route Handlers and Server Actions do
          // permit the write, so their refreshes land here immediately.
        }
      },
    },
  });
}
