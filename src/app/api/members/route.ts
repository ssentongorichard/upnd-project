import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { MemberCreateSchema } from '@/lib/validation';

export async function GET() {
  try {
    const rows = await db.select().from(members).orderBy(desc(members.createdAt));
    const mapped = rows.map((row: any) => ({
      id: row.id,
      membershipId: row.membershipId,
      fullName: row.fullName,
      nrcNumber: row.nrcNumber,
      dateOfBirth: row.dateOfBirth,
      residentialAddress: row.residentialAddress,
      phone: row.phone,
      email: row.email,
      endorsements: [],
      status: row.status,
      registrationDate: row.registrationDate,
      jurisdiction: {
        province: row.province,
        district: row.district,
        constituency: row.constituency,
        ward: row.ward,
        branch: row.branch,
        section: row.section,
      },
      disciplinaryRecords: [],
      appeals: [],
      partyCommitment: row.partyCommitment,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MemberCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const membershipId = `UPND${Date.now()}`;
    const payload = parsed.data;

    const [inserted] = await db.insert(members).values({
      membershipId,
      fullName: payload.fullName,
      nrcNumber: payload.nrcNumber,
      dateOfBirth: payload.dateOfBirth as any,
      residentialAddress: payload.residentialAddress,
      phone: payload.phone,
      email: payload.email,
      province: payload.jurisdiction.province,
      district: payload.jurisdiction.district,
      constituency: payload.jurisdiction.constituency,
      ward: payload.jurisdiction.ward,
      branch: payload.jurisdiction.branch,
      section: payload.jurisdiction.section,
      status: 'Pending Section Review',
      partyCommitment: 'Unity, Work, Progress'
    }).returning();

    const mapped = {
      id: inserted.id,
      membershipId: inserted.membershipId,
      fullName: inserted.fullName,
      nrcNumber: inserted.nrcNumber,
      dateOfBirth: inserted.dateOfBirth,
      residentialAddress: inserted.residentialAddress,
      phone: inserted.phone,
      email: inserted.email,
      endorsements: [],
      status: inserted.status,
      registrationDate: inserted.registrationDate,
      jurisdiction: {
        province: inserted.province,
        district: inserted.district,
        constituency: inserted.constituency,
        ward: inserted.ward,
        branch: inserted.branch,
        section: inserted.section,
      },
      disciplinaryRecords: [],
      appeals: [],
      partyCommitment: inserted.partyCommitment,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
