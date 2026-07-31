import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

/**
 * Every matched request passes through the session refresh and the authentication gate in
 * lib/supabase/middleware.ts. The platform is private by default: pages redirect to /login,
 * API routes answer 401, and only /login is reachable without a session.
 */
export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Everything except static assets and image requests.
   *
   * The trailing extension group also matches `/api/media/**.png`, so image bytes skip the
   * middleware. That is a deliberate performance choice and not a hole: the media route
   * authenticates on its own through withMediaStore, and in Supabase mode Storage RLS
   * refuses objects outside the caller's own owner folder even if the route were wrong.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
