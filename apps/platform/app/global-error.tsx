'use client';

/**
 * Last-resort boundary: catches failures in the root layout itself.
 *
 * This component replaces the root layout when it renders, so it must supply its own
 * <html> and <body> — and it cannot rely on globals.css, which the (failed) layout is
 * the one that imports. Everything here is therefore inline, and still RTL Hebrew.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: '#F5F6F8',
          color: '#12151A',
          fontFamily: '"Assistant", "Heebo", system-ui, -apple-system, sans-serif',
        }}
      >
        <main
          style={{
            width: '100%',
            maxWidth: '34rem',
            background: '#FFFFFF',
            border: '1px solid #E3E6EB',
            borderRadius: '1rem',
            padding: '1.75rem',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            הפלטפורמה לא הצליחה להיטען
          </h1>
          <p style={{ margin: '0.75rem 0 0', fontSize: '1rem', lineHeight: 1.7, color: '#4A5260' }}>
            אירעה תקלה בשכבה הראשית של האפליקציה. הנתונים השמורים לא נפגעו.
          </p>

          {error.digest && (
            <p
              dir="ltr"
              style={{
                margin: '1rem 0 0',
                padding: '0.5rem 0.75rem',
                background: '#F0F2F5',
                borderRadius: '0.5rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.8125rem',
                color: '#6B7280',
                textAlign: 'start',
              }}
            >
              {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              height: '2.5rem',
              padding: '0 1.25rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: '#4F46E5',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            טעינה מחדש
          </button>
        </main>
      </body>
    </html>
  );
}
