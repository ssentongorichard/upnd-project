import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members, events, disciplinaryCases, membershipCards } from '@/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get member statistics
    const [totalMembers] = await db.select({ count: count() }).from(members);
    
    const [pendingApplications] = await db
      .select({ count: count() })
      .from(members)
      .where(sql`${members.status} LIKE '%Pending%'`);
    
    const [approvedMembers] = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.status, 'Approved'));
    
    const [rejectedApplications] = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.status, 'Rejected'));
    
    const [suspendedMembers] = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.status, 'Suspended'));

    // Get provincial distribution
    const provincialDistribution = await db
      .select({
        province: members.province,
        count: count()
      })
      .from(members)
      .groupBy(members.province);

    // Get monthly trends (last 12 months)
    const monthlyTrends = await db
      .select({
        month: sql<string>`TO_CHAR(${members.registrationDate}, 'YYYY-MM')`,
        registrations: count()
      })
      .from(members)
      .where(sql`${members.registrationDate} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`TO_CHAR(${members.registrationDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${members.registrationDate}, 'YYYY-MM')`);

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: members.status,
        count: count()
      })
      .from(members)
      .groupBy(members.status);

    // Get event statistics
    const [totalEvents] = await db.select({ count: count() }).from(events);
    const [activeEvents] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.status, 'Active'));

    // Get disciplinary case statistics
    const [totalDisciplinaryCases] = await db.select({ count: count() }).from(disciplinaryCases);
    const [activeDisciplinaryCases] = await db
      .select({ count: count() })
      .from(disciplinaryCases)
      .where(eq(disciplinaryCases.status, 'Active'));

    // Get membership card statistics
    const [totalMembershipCards] = await db.select({ count: count() }).from(membershipCards);
    const [activeMembershipCards] = await db
      .select({ count: count() })
      .from(membershipCards)
      .where(eq(membershipCards.status, 'Active'));

    const statistics = {
      members: {
        total: totalMembers.count,
        pending: pendingApplications.count,
        approved: approvedMembers.count,
        rejected: rejectedApplications.count,
        suspended: suspendedMembers.count,
        provincialDistribution: provincialDistribution.reduce((acc, item) => {
          acc[item.province] = item.count;
          return acc;
        }, {} as Record<string, number>),
        monthlyTrends: monthlyTrends.map(item => ({
          month: item.month,
          registrations: item.registrations
        })),
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      events: {
        total: totalEvents.count,
        active: activeEvents.count
      },
      disciplinary: {
        total: totalDisciplinaryCases.count,
        active: activeDisciplinaryCases.count
      },
      membershipCards: {
        total: totalMembershipCards.count,
        active: activeMembershipCards.count
      }
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}