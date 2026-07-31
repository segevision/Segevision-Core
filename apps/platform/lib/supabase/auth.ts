import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from './server';

/**
 * Who is asking — for Server Components and Route Handlers.
 *
 * `getUser()` and not `getSession()`. getSession reads the cookie and believes it;
 * getUser validates the token against the Auth server. For an authorisation decision
 * the difference is the whole point, because a cookie is attacker-supplied input.
 *
 * Middleware already blocks unauthenticated traffic, so in practice this returns a user.
 * The routes check anyway: middleware matchers are configuration, and configuration
 * changes. Two independent checks in front of client data is the right number.
 */
export async function currentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

/** The one 401 shape the fetch layer in lib/client.ts knows how to surface. */
export function unauthorizedJson(): NextResponse {
  return NextResponse.json({ error: 'נדרשת התחברות מחדש' }, { status: 401 });
}
