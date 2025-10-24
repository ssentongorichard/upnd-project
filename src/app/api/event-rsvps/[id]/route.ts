import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventRsvps } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const patch = await req.json();
    const [updated] = await db.update(eventRsvps).set(patch).where(eq(eventRsvps.id, id as any)).returning();
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}
