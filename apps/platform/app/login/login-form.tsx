'use client';

import * as React from 'react';
import { signInAction } from '../../lib/auth-actions';

/**
 * The login form.
 *
 * Submits to a Server Action through a transition rather than posting a plain form, so the
 * Hebrew error appears in place without the page reloading and losing the typed email.
 * On success the action itself redirects — the browser never sees an intermediate state.
 *
 * The email and password inputs are `dir="ltr"` inside an otherwise RTL page. Both hold
 * Latin text, and in an RTL field a Latin string puts the caret and any punctuation in the
 * wrong place, which is the kind of detail that makes a Hebrew interface feel translated
 * rather than native.
 */
export function LoginForm({ next }: { next: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await signInAction({ error: null }, formData);
      // A successful sign-in redirects inside the action, so anything that comes back is
      // a failure worth showing.
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-ui-sm font-semibold text-studio-ink">
          כתובת אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          autoFocus
          required
          aria-invalid={error ? true : undefined}
          className="h-11 rounded-md border border-studio-line bg-studio-raised px-3 text-start text-ui-base text-studio-ink transition-colors placeholder:text-studio-faint hover:border-studio-line-strong focus-visible:border-studio-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40"
          placeholder="name@segevision.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-ui-sm font-semibold text-studio-ink">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          className="h-11 rounded-md border border-studio-line bg-studio-raised px-3 text-start text-ui-base text-studio-ink transition-colors hover:border-studio-line-strong focus-visible:border-studio-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40"
        />
      </div>

      {/* role="alert" so a screen reader announces the failure without the user having to
          go looking for it. Reserved space is not held: the form is short enough that the
          shift is not disorienting, and an always-present empty region reads as a bug. */}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md bg-studio-danger/10 px-3 py-2.5 text-ui-sm font-medium text-studio-danger"
        >
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4.5M12 16h.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-studio-accent px-4 text-ui-base font-bold text-studio-accent-ink transition-all duration-200 ease-studio hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent focus-visible:ring-offset-2 focus-visible:ring-offset-studio-panel disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            מתחבר…
          </>
        ) : (
          'התחברות'
        )}
      </button>
    </form>
  );
}
