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
        <PasswordField invalid={Boolean(error)} />
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

/**
 * The password field, with a reveal toggle.
 *
 * Placement is the one genuinely direction-dependent decision here. The page is RTL, but
 * the input carries `dir="ltr"` because a password is Latin — so the caret and the dots
 * begin at the *left* edge of the box and the free space is on the right. The toggle
 * therefore sits at the field's inline-start (`start-2`, which resolves to the right in
 * this RTL document), where it can never sit on top of what is being typed. Reserved
 * padding on the input's own inline-end keeps a long password from sliding under it.
 *
 * The reserved space is present whether or not the password is revealed, and the button is
 * absolutely positioned, so toggling causes no layout shift.
 *
 * The input stays uncontrolled: the password lives in the DOM node and is read once, by
 * FormData, on submit. It never enters React state, never becomes a prop, and is never
 * logged. `spellCheck={false}` matters more than it looks — a revealed `type="text"` field
 * is eligible for spellchecking, which on some platforms means sending its contents away.
 */
function PasswordField({ invalid }: { invalid: boolean }) {
  const [revealed, setRevealed] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggle = () => {
    const input = inputRef.current;
    // Changing an input's type resets its selection in most browsers, so the caret is
    // captured before the swap and put back after it.
    const caret = input ? { start: input.selectionStart, end: input.selectionEnd } : null;

    setRevealed((value) => !value);

    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      node.focus({ preventScroll: true });
      if (caret?.start != null && caret.end != null) {
        try {
          node.setSelectionRange(caret.start, caret.end);
        } catch {
          // Selection is not settable on every input type in every browser; focus alone is
          // still the important half.
        }
      }
    });
  };

  const label = revealed ? 'הסתרת סיסמה' : 'הצגת סיסמה';

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id="password"
        name="password"
        type={revealed ? 'text' : 'password'}
        dir="ltr"
        autoComplete="current-password"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        required
        aria-invalid={invalid ? true : undefined}
        className="h-11 w-full rounded-md border border-studio-line bg-studio-raised ps-3 pe-11 text-start text-ui-base text-studio-ink transition-colors hover:border-studio-line-strong focus-visible:border-studio-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent/40"
      />

      <button
        type="button"
        // Suppresses the focus grab, so a mouse click leaves the caret exactly where it
        // was. Keyboard activation still lands on the button, and the handler returns
        // focus to the input afterwards.
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggle}
        aria-label={label}
        aria-controls="password"
        title={label}
        className='absolute start-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-studio-muted transition-colors hover:bg-studio-line/40 hover:text-studio-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-accent touch:after:absolute touch:after:left-1/2 touch:after:top-1/2 touch:after:h-11 touch:after:w-11 touch:after:-translate-x-1/2 touch:after:-translate-y-1/2 touch:after:content-[""]'
      >
        {/* Both glyphs share a viewBox and stroke weight, so swapping them cannot nudge
            anything by a pixel. */}
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          {revealed ? (
            <>
              <path
                d="M2 12s3.6-6 10-6c1.7 0 3.2.4 4.5 1M22 12s-3.6 6-10 6c-1.8 0-3.4-.5-4.7-1.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="2.6" />
              <path d="m3.5 3.5 17 17" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2.6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
