import { NextResponse } from 'next/server';
import { safeParseProject } from '@segevision/renderer';
import { withProjectStore } from '../../../lib/api';

// Project data is read per request; caching it would serve stale content straight after a
// save. The session cookie makes these routes dynamic regardless.
export const dynamic = 'force-dynamic';

export async function GET() {
  return withProjectStore(async (store) => {
    const projects = await store.list();
    return NextResponse.json({ projects });
  });
}

export async function POST(request: Request) {
  return withProjectStore(async (store) => {
    const body = await request.json().catch(() => null);
    const parsed = safeParseProject(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'הפרויקט שנשלח אינו תקין', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    // create() writes unconditionally, so without this guard a POST carrying an id that
    // already exists would replace a real project. A read that *throws* counts as
    // "occupied" too: an unreadable project is still someone's work.
    //
    // In Supabase mode the primary key is a second, race-free guard behind this one — the
    // check is here to produce a good error, not to be the only defence.
    const occupied = await store.get(parsed.data.id).catch(() => 'unreadable' as const);
    if (occupied !== null) {
      return NextResponse.json({ error: 'כבר קיים פרויקט עם המזהה הזה' }, { status: 409 });
    }

    const created = await store.create(parsed.data);
    return NextResponse.json({ project: created }, { status: 201 });
  });
}
