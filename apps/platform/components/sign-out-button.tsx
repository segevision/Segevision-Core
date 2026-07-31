'use client';

import * as React from 'react';
import { signOutAction } from '../lib/auth-actions';

/**
 * Sign out, styled as a peer of ThemeToggle so the header keeps one visual rhythm.
 *
 * A button inside a form rather than a link: signing out is a state change, and a GET that
 * ends a session can be triggered by any prefetch or image tag that happens to point at it.
 */
export function SignOutButton() {
  const [pending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
      aria-label="יציאה מהמערכת"
      title="יציאה"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-raised hover:text-studio-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        {/* Drawn for RTL from the start: door on the right, arrow leaving to the left.
            The usual LTR logout glyph mirrored, rather than an LTR glyph dropped into an
            RTL header pointing back into the room. */}
        <path
          d="M15 4.5h2.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H15"
          strokeLinecap="round"
        />
        <path d="M11 8.5 7 12l4 3.5M7 12h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
