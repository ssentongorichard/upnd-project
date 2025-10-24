import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eventRsvps, members } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const rows = await db
      .select({
        id: eventRsvps.id,
        eventId: eventRsvps.eventId,
        memberId: eventRsvps.memberId,
        response: eventRsvps.response,
        respondedAt: eventRsvps.respondedAt,
        checkedIn: eventRsvps.checkedIn,
        checkedInAt: eventRsvps.checkedInAt,
        notes: eventRsvps.notes,
        memberFullName: members.fullName,
        memberMembershipId: members.membershipId,
        memberPhone: members.phone,
        memberEmail: members.email,
      })
      .from(eventRsvps)
      .leftJoin(members, eq(eventRsvps.memberId, members.id))
      .where(eq(eventRsvps.eventId, eventId as any))
      .orderBy(desc(eventRsvps.respondedAt));

    const formatted = rows.map((r) => ({
      id: r.id,
      event_id: r.eventId,
      member_id: r.memberId,
      response: r.response,
      responded_at: r.respondedAt,
      checked_in: r.checkedIn,
      checked_in_at: r.checkedInAt,
      notes: r.notes,
      member: {
        full_name: r.memberFullName,
        membership_id: r.memberMembershipId,
        phone: r.memberPhone as string,
        email: r.memberEmail as string,
      },
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}
