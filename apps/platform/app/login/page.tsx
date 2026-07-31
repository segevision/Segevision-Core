import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '../../lib/supabase/auth';
import { ThemeToggle } from '../../components/theme-toggle';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'התחברות — Segevision',
  robots: { index: false, follow: false },
};

// The page reads the session cookie, so it can never be prerendered.
export const dynamic = 'force-dynamic';

/**
 * The only unauthenticated page in the platform.
 *
 * Middleware already sends signed-in visitors away from here; the check below repeats it
 * because a matcher is configuration and this is the page that would leak a login form to
 * someone who is already inside.
 */
export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const user = await currentUser();
  if (user) redirect('/');

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-studio-canvas">
      <header className="flex items-center justify-between px-5 py-4 desktop:px-8">
        <div className="flex items-baseline gap-2.5">
          <span className="text-ui-lg font-extrabold tracking-tight text-studio-ink">
            Segevision
          </span>
          <span className="hidden border-s border-studio-line ps-2.5 text-ui-sm text-studio-muted tablet:inline">
            סטודיו האתרים
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex items-start justify-center px-5 pb-12 pt-4 tablet:items-center tablet:pb-20 tablet:pt-0">
        <div className="w-full max-w-[26rem]">
          <div className="rounded-lg border border-studio-line bg-studio-panel p-6 shadow-studio-lg tablet:p-8">
            <h1 className="text-ui-2xl font-extrabold tracking-tight text-studio-ink">
              התחברות לפלטפורמה
            </h1>
            <p className="mt-2 text-ui-sm leading-relaxed text-studio-muted">
              המערכת פרטית ומיועדת לצוות Segevision. אין הרשמה עצמית — חשבון נפתח ידנית.
            </p>

            <div className="mt-6">
              <LoginForm next={searchParams.next ?? '/'} />
            </div>
          </div>

          <p className="mt-5 text-center text-ui-xs leading-relaxed text-studio-faint">
            שכחת סיסמה או צריך חשבון נוסף? אפשר לאפס ולנהל הרשאות דרך לוח הבקרה של Supabase.
          </p>
        </div>
      </main>
    </div>
  );
}
