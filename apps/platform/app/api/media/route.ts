import { NextResponse } from 'next/server';
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from '../../../lib/media-storage';
import { withMediaStore } from '../../../lib/api';
import { resolveProjectStore } from '../../../lib/project-store';

export const dynamic = 'force-dynamic';

/** Multipart upload. Returns the same-origin URL the project stores as `src`. */
export async function POST(request: Request) {
  return withMediaStore(async (store) => {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'הבקשה אינה בפורמט הנדרש' }, { status: 400 });
    }

    const projectId = String(form.get('projectId') ?? '');
    const slot = String(form.get('slot') ?? '');
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

    // An upload is only ever meaningful against a project the caller can actually open.
    // In Supabase mode RLS makes someone else's project invisible here, so this both
    // catches a stale editor tab and stops the bucket filling with objects that no
    // document will ever reference.
    const { store: projects } = await resolveProjectStore();
    if ((await projects.get(projectId)) === null) {
      return NextResponse.json({ error: 'הפרויקט לא נמצא' }, { status: 404 });
    }

    try {
      const saved = await store.save({
        projectId,
        // An empty slot is not an error: the path segment exists to make the bucket
        // legible, and the document is what actually binds an image to a slot.
        slot: slot || 'unsorted',
        buffer: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      });
      return NextResponse.json({ media: saved }, { status: 201 });
    } catch (cause) {
      return NextResponse.json({ error: (cause as Error).message }, { status: 400 });
    }
  });
}
