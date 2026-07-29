import { NextResponse } from 'next/server';
import { MigrationError, safeParseProject } from '@segevision/renderer';
import { projectStore } from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const project = await projectStore.get(params.id);
    if (!project) {
      return NextResponse.json({ error: 'הפרויקט לא נמצא' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (cause) {
    // A failed migration leaves the stored file untouched; the user gets a real
    // explanation and a recovery hint instead of a misleading "not found".
    if (cause instanceof MigrationError) {
      return NextResponse.json(
        {
          error: cause.message,
          recovery: 'קובץ הפרויקט המקורי לא שוּנה. גיבוי נשמר בתיקיית .data/backups וניתן לשחזור ידני.',
        },
        { status: 422 },
      );
    }
    throw cause;
  }
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null);
  const parsed = safeParseProject(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'הפרויקט שנשלח אינו תקין', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await projectStore.get(params.id);
  if (!existing) {
    return NextResponse.json({ error: 'הפרויקט לא נמצא' }, { status: 404 });
  }

  const updated = await projectStore.update(params.id, parsed.data);
  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  await projectStore.remove(params.id);
  return NextResponse.json({ ok: true });
}
