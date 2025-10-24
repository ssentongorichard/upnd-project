import { NextResponse } from 'next/server';
import { db } from '@/db';
import { membershipCards, members } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db
      .select({
        id: membershipCards.id,
        memberId: membershipCards.memberId,
        cardType: membershipCards.cardType,
        issueDate: membershipCards.issueDate,
        expiryDate: membershipCards.expiryDate,
        status: membershipCards.status,
        renewalReminderSent: membershipCards.renewalReminderSent,
        renewalReminderSentAt: membershipCards.renewalReminderSentAt,
        lastRenewedAt: membershipCards.lastRenewedAt,
        memberFullName: members.fullName,
        memberMembershipId: members.membershipId,
        memberEmail: members.email,
        memberPhone: members.phone,
      })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id))
      .orderBy(asc(membershipCards.expiryDate));

    const formatted = rows.map((r) => ({
      id: r.id,
      member_id: r.memberId,
      card_type: r.cardType,
      issue_date: r.issueDate,
      expiry_date: r.expiryDate,
      status: r.status,
      renewal_reminder_sent: r.renewalReminderSent,
      member: {
        full_name: r.memberFullName,
        membership_id: r.memberMembershipId,
        email: r.memberEmail as string,
        phone: r.memberPhone as string,
      },
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch membership cards' }, { status: 500 });
  }
}
