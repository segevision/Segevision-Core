import { NextResponse } from 'next/server';
import { mediaStore } from '../../../../../lib/media-storage';

export const dynamic = 'force-dynamic';

interface Params {
  params: { projectId: string; fileName: string };
}

export async function GET(_request: Request, { params }: Params) {
  const file = await mediaStore.read(params.projectId, params.fileName);
  if (!file) {
    return NextResponse.json({ error: 'הקובץ לא נמצא' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      'content-type': file.contentType,
      // File names are content-addressed UUIDs, so a long cache is safe: replacing an
      // image always produces a new URL.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  await mediaStore.remove(params.projectId, params.fileName);
  return NextResponse.json({ ok: true });
}
