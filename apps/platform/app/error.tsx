'use client';

import * as React from 'react';
import Link from 'next/link';
import { StudioButton } from '../components/studio';

/**
 * Route-level error boundary.
 *
 * Without this file Next serves a bare, untranslated "Internal Server Error" body with
 * nothing to act on — which is exactly what made the last runtime failure on /new so
 * hard to diagnose. The digest below is the id Next writes next to the real stack trace
 * in the server log, so a screenshot of this screen is enough to find the trace.
 */
export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surfaced in the browser console too, so a client-side failure is not silent.
    console.error('[studio] route error', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[34rem] rounded-2xl bg-studio-panel p-6 ring-1 ring-studio-line">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-studio-danger/10 text-studio-danger">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className="mt-4 text-ui-2xl font-extrabold tracking-tight text-studio-ink">
          משהו נשבר בעמוד הזה
        </h1>
        <p className="mt-2 text-ui-base leading-relaxed text-studio-soft">
          התקלה נרשמה ביומן השרת. אפשר לנסות לטעון מחדש — הנתונים השמורים לא נפגעו.
        </p>

        {error.digest && (
          <div className="mt-4 rounded-lg bg-studio-sunken px-3 py-2">
            <span className="text-ui-label text-studio-faint">מזהה התקלה לאיתור ביומן</span>
            <p className="mt-0.5 font-studio-mono text-ui-sm text-studio-muted" dir="ltr">
              {error.digest}
            </p>
          </div>
        )}

        {process.env.NODE_ENV !== 'production' && error.message && (
          <pre
            dir="ltr"
            className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-studio-sunken px-3 py-2 text-start font-studio-mono text-ui-xs leading-relaxed text-studio-danger"
          >
            {error.message}
          </pre>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StudioButton variant="primary" onClick={reset}>
            ניסיון נוסף
          </StudioButton>
          <Link
            href="/"
            className="text-ui-sm font-semibold text-studio-muted transition-colors hover:text-studio-ink"
          >
            חזרה לפרויקטים
          </Link>
        </div>
      </div>
    </div>
  );
}
