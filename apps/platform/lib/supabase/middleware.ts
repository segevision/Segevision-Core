import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { supabaseEnv } from './env';

/**
 * Session refresh and the authentication gate, run from middleware.ts on every matched
 * request.
 *
 * Two jobs, in this order, because the second depends on the first:
 *
 *   1. Refresh the session. Access tokens are short-lived and Server Components cannot
 *      write cookies, so middleware is the only place a token that expired between
 *      navigations can be renewed. `getUser()` is what does the work: it validates the
 *      token against the Auth server and, when it has expired, the SDK writes the new
 *      token pair through `setAll` below. Without that call the cookie plumbing is in
 *      place but nothing is ever refreshed, and people get signed out an hour in.
 *
 *   2. Refuse the request if there is no user. Pages get a redirect to /login carrying
 *      where they were going; API routes get a 401 in JSON. That distinction matters —
 *      redirecting a fetch() would hand the editor an HTML login page with a 200 status,
 *      and the fetch layer would report "unexpected token <" instead of "please sign in".
 */

/** The only paths reachable without a session. Everything else is private by default. */
function isPublicPath(pathname: string): boolean {
  return pathname === '/login';
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, key } = supabaseEnv();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Refreshed cookies have to reach two places: the request, so the page being
        // rendered right now already sees the new session, and the response, so the
        // browser sends it next time. Rebuilding the response from the mutated request is
        // how the first half sticks.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Nothing between createServerClient and getUser(). Any code in that gap that reads
  // cookies or returns early sees a half-initialised session, which produces logouts that
  // are extremely hard to reproduce.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return withRefreshedCookies(
        NextResponse.json({ error: 'נדרשת התחברות מחדש' }, { status: 401 }),
        supabaseResponse,
      );
    }

    if (!isPublicPath(pathname)) {
      const target = request.nextUrl.clone();
      target.pathname = '/login';
      target.search = '';
      // Where they were heading, so signing in returns them to the same project rather
      // than dumping them on the dashboard.
      target.searchParams.set('next', `${pathname}${search}`);
      return withRefreshedCookies(NextResponse.redirect(target), supabaseResponse);
    }
  }

  // Signed in and looking at the login form: send them where they were going.
  if (user && isPublicPath(pathname)) {
    const target = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get('next');
    target.pathname = next?.startsWith('/') && !next.startsWith('//') ? next : '/';
    target.search = '';
    return withRefreshedCookies(NextResponse.redirect(target), supabaseResponse);
  }

  return supabaseResponse;
}

/**
 * Copies any cookies Supabase just refreshed onto a response we are returning instead of
 * `supabaseResponse`.
 *
 * Forgetting this is the classic @supabase/ssr bug: the refresh happens, the new tokens are
 * written to a response that is then thrown away, and the browser keeps presenting the old
 * pair. The user is bounced to /login on every second request with nothing in the logs.
 */
function withRefreshedCookies(response: NextResponse, source: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
