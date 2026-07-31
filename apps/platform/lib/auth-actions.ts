'use server';

import { redirect } from 'next/navigation';
import { AuthApiError } from '@supabase/supabase-js';
import { createClient } from './supabase/server';

/**
 * Sign in and sign out.
 *
 * Server Actions rather than a client-side `signInWithPassword`, for one reason that
 * matters: the session cookies are written by the server, so they can be `httpOnly` and
 * are never readable by script in the page. A token that JavaScript cannot read is a token
 * an injected script cannot steal.
 *
 * There is no sign-up action, and that is deliberate — the platform is private. New
 * accounts are created deliberately in the Supabase dashboard (Authentication → Users);
 * see DEPLOYMENT.md. Adding a public sign-up form would turn a private studio tool into an
 * open one with a single deploy.
 */

export interface SignInState {
  error: string | null;
}

/**
 * Keeps an open redirect out of the login flow.
 *
 * `next` arrives from a query string, so it is attacker-controlled: a link to
 * `/login?next=https://evil.example` would otherwise turn our own login form into a
 * credible phishing hop. Only same-site absolute paths are honoured, and `//host` is
 * rejected because the browser reads it as protocol-relative.
 */
function safeNext(next: unknown): string {
  const value = typeof next === 'string' ? next : '';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));

  if (!email || !password) {
    return { error: 'יש להזין כתובת אימייל וסיסמה.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Deliberately one message for "no such user" and "wrong password". Distinguishing
    // them tells an attacker which addresses are registered.
    if (error instanceof AuthApiError && error.status === 400) {
      return { error: 'האימייל או הסיסמה שגויים.' };
    }
    if (error instanceof AuthApiError && error.status === 429) {
      return { error: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד כמה דקות.' };
    }
    console.error('[auth] sign-in failed:', error.message);
    return { error: 'ההתחברות נכשלה כרגע. יש לנסות שוב בעוד רגע.' };
  }

  // redirect() throws internally, so it must sit outside any try/catch above it.
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  // Local scope: this browser only. A studio owner signing out of a laptop should not be
  // signed out of their phone mid-review.
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}
