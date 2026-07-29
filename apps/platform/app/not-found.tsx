import Link from 'next/link';

/** Replaces Next's built-in, English, LTR 404 body. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[30rem] text-center">
        <p className="font-studio-mono text-ui-3xl font-bold text-studio-faint" dir="ltr">
          404
        </p>
        <h1 className="mt-3 text-ui-2xl font-extrabold tracking-tight text-studio-ink">
          העמוד לא נמצא
        </h1>
        <p className="mt-2 text-ui-base leading-relaxed text-studio-soft">
          ייתכן שהפרויקט נמחק, או שהכתובת הוקלדה חלקית.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-studio-accent px-4 text-ui-base font-semibold text-studio-accent-ink transition-[filter] hover:brightness-110"
        >
          חזרה לפרויקטים
        </Link>
      </div>
    </div>
  );
}
