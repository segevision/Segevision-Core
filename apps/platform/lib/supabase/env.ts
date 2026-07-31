/**
 * Supabase connection details — resolved in one place.
 *
 * Both variables are `NEXT_PUBLIC_`, so they are inlined into the browser bundle at
 * build time. That is by design: the publishable key grants nothing on its own, and
 * Row Level Security on the tables is the actual boundary. The service-role key
 * bypasses RLS and must never be read from this app — it belongs only to the local
 * migration script described in DEPLOYMENT.md §3.5.
 *
 * Going through one function instead of `process.env.X!` at three call sites means a
 * missing variable fails with a sentence naming the variable, rather than surfacing as
 * an "Invalid URL" from somewhere inside the SDK.
 */

export interface SupabaseEnv {
  url: string;
  key: string;
}

export function supabaseEnv(): SupabaseEnv {
  // Both reads must stay as literal `process.env.NEXT_PUBLIC_*` member access —
  // that is the form Next replaces at build time. Destructuring `process.env` here
  // would leave them undefined in the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL',
      !key && 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ].filter((name): name is string => Boolean(name));

    throw new Error(
      `Supabase is not configured — missing ${missing.join(', ')}. ` +
        'Copy apps/platform/.env.example to apps/platform/.env.local and restart the dev server.',
    );
  }

  return { url, key };
}
