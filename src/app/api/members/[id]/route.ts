import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MemberUpdateSchema } from '@/lib/validation';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const parsed = MemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updatePayload: any = {};
    const data = parsed.data;

    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.nrcNumber !== undefined) updatePayload.nrcNumber = data.nrcNumber;
    if (data.dateOfBirth !== undefined) updatePayload.dateOfBirth = data.dateOfBirth as any;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.residentialAddress !== undefined) updatePayload.residentialAddress = data.residentialAddress;
    if (data.partyCommitment !== undefined) updatePayload.partyCommitment = data.partyCommitment;

    if (data.jurisdiction) {
      if (data.jurisdiction.province !== undefined) updatePayload.province = data.jurisdiction.province;
      if (data.jurisdiction.district !== undefined) updatePayload.district = data.jurisdiction.district;
      if (data.jurisdiction.constituency !== undefined) updatePayload.constituency = data.jurisdiction.constituency;
      if (data.jurisdiction.ward !== undefined) updatePayload.ward = data.jurisdiction.ward;
      if (data.jurisdiction.branch !== undefined) updatePayload.branch = data.jurisdiction.branch;
      if (data.jurisdiction.section !== undefined) updatePayload.section = data.jurisdiction.section;
    }

    if (data.status !== undefined) updatePayload.status = data.status;

    const [updated] = await db
      .update(members)
      .set(updatePayload)
      .where(eq(members.id, id as any))
      .returning();

    const mapped = {
      id: updated.id,
      membershipId: updated.membershipId,
      fullName: updated.fullName,
      nrcNumber: updated.nrcNumber,
      dateOfBirth: updated.dateOfBirth,
      residentialAddress: updated.residentialAddress,
      phone: updated.phone,
      email: updated.email,
      endorsements: [],
      status: updated.status,
      registrationDate: updated.registrationDate,
      jurisdiction: {
        province: updated.province,
        district: updated.district,
        constituency: updated.constituency,
        ward: updated.ward,
        branch: updated.branch,
        section: updated.section,
      },
      disciplinaryRecords: [],
      appeals: [],
      partyCommitment: updated.partyCommitment,
    };

    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}
