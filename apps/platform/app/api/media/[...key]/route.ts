import { NextResponse } from 'next/server';
import { withMediaStore } from '../../../../lib/api';

export const dynamic = 'force-dynamic';

interface Params {
  params: { key: string[] };
}

/**
 * Serves stored image bytes, whichever backend holds them.
 *
 * A catch-all rather than the previous `[projectId]/[fileName]` pair because the two
 * backends key their objects differently — two segments locally,
 * `<owner>/<project>/<slot>/<file>` in Supabase Storage. Accepting both shapes is what
 * lets project documents written before the migration keep resolving in local mode.
 */
export async function GET(_request: Request, { params }: Params) {
  return withMediaStore(async (store) => {
    const file = await store.read(params.key.join('/'));
    if (!file) {
      return NextResponse.json({ error: 'הקובץ לא נמצא' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'content-type': file.contentType,
        // File names are uuids, so a replacement always produces a new URL and the bytes
        // at this one never change. `private` and not `public`: the response now depends
        // on the session, and a shared cache must never hand one account's image to
        // another.
        'cache-control': 'private, max-age=31536000, immutable',
        // Uploads may include SVG, which is script-capable when opened as a top-level
        // document. It is inert inside <img>, where the editor and the renderer use it,
        // but this route is also directly navigable. The sandbox plus a null default-src
        // means a hostile SVG cannot execute in our origin even then, and nosniff stops a
        // mislabelled file being reinterpreted as HTML.
        'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'x-content-type-options': 'nosniff',
      },
    });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withMediaStore(async (store) => {
    await store.remove(params.key.join('/'));
    return NextResponse.json({ ok: true });
  });
}
