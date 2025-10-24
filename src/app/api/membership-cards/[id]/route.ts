import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { membershipCards } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const patch = await req.json();
    const [updated] = await db.update(membershipCards).set(patch).where(eq(membershipCards.id, id as any)).returning();
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}
