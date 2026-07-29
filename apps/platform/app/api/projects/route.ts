import { NextResponse } from 'next/server';
import { safeParseProject } from '@segevision/renderer';
import { projectStore } from '../../../lib/storage';

// Project data is read from disk on every request; caching it would serve stale
// content straight after a save.
export const dynamic = 'force-dynamic';

export async function GET() {
  const projects = await projectStore.list();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = safeParseProject(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'הפרויקט שנשלח אינו תקין', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // create() writes the file unconditionally, so without this guard a POST carrying an
  // id that already exists silently replaces a real project. A read that *throws* is
  // treated as "occupied" too: an unreadable file is still someone's work.
  const occupied = await projectStore.get(parsed.data.id).catch(() => 'unreadable' as const);
  if (occupied !== null) {
    return NextResponse.json({ error: 'כבר קיים פרויקט עם המזהה הזה' }, { status: 409 });
  }

  const created = await projectStore.create(parsed.data);
  return NextResponse.json({ project: created }, { status: 201 });
}
