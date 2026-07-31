import { NextResponse } from 'next/server';
import { MigrationError, safeParseProject } from '@segevision/renderer';
import { withProjectStore } from '../../../../lib/api';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  return withProjectStore(async (store) => {
    try {
      const project = await store.get(params.id);
      if (!project) {
        return NextResponse.json({ error: 'הפרויקט לא נמצא' }, { status: 404 });
      }
      return NextResponse.json({ project });
    } catch (cause) {
      // A failed migration leaves the stored document untouched; the user gets a real
      // explanation and a recovery hint instead of a misleading "not found".
      if (cause instanceof MigrationError) {
        return NextResponse.json(
          {
            error: cause.message,
            recovery:
              'מסמך הפרויקט המקורי לא שוּנה. בגרסה המקומית נשמר גיבוי בתיקיית .data/backups; ב‑Supabase ניתן לשחזר דרך Point-in-Time Recovery.',
          },
          { status: 422 },
        );
      }
      throw cause;
    }
  });
}

export async function PUT(request: Request, { params }: Params) {
  return withProjectStore(async (store) => {
    const body = await request.json().catch(() => null);
    const parsed = safeParseProject(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'הפרויקט שנשלח אינו תקין', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    // In Supabase mode this read doubles as the ownership check: RLS makes another owner's
    // project invisible, so a cross-account save becomes a 404 rather than an update of a
    // row the caller was never allowed to see.
    const existing = await store.get(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'הפרויקט לא נמצא' }, { status: 404 });
    }

    const updated = await store.update(params.id, parsed.data);
    return NextResponse.json({ project: updated });
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withProjectStore(async (store) => {
    await store.remove(params.id);
    // Media objects belonging to the project are deliberately left in the bucket. An
    // accidental delete is only recoverable if the images still exist, so a few orphaned
    // objects in a private bucket are the cheaper mistake. DEPLOYMENT.md has the cleanup
    // query for when that stops being true.
    return NextResponse.json({ ok: true });
  });
}
