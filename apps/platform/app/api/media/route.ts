import { NextResponse } from 'next/server';
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, mediaStore } from '../../../lib/media-storage';

export const dynamic = 'force-dynamic';

/** Multipart upload. Returns the same-origin URL the project stores as `src`. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'הבקשה אינה בפורמט הנדרש' }, { status: 400 });
  }

  const projectId = String(form.get('projectId') ?? '');
  const file = form.get('file');

  if (!projectId) {
    return NextResponse.json({ error: 'חסר מזהה פרויקט' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
  }
  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json(
      { error: 'אפשר להעלות תמונות בלבד — JPG, PNG, WebP, AVIF, SVG או GIF' },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'הקובץ גדול מ‑8MB' }, { status: 413 });
  }

  try {
    const saved = await mediaStore.save(projectId, {
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
    return NextResponse.json({ media: saved }, { status: 201 });
  } catch (cause) {
    return NextResponse.json({ error: (cause as Error).message }, { status: 400 });
  }
}
