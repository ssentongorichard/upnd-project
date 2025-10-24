'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { members } from '@/db/schema';
import { MemberCreateSchema, MemberUpdateSchema } from '@/lib/validation';
import { desc, eq } from 'drizzle-orm';

export async function listMembers() {
  const rows = await db.select().from(members).orderBy(desc(members.createdAt));
  return rows;
}

export async function createMember(raw: unknown) {
  const parsed = MemberCreateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  const data = parsed.data;
  const membershipId = `UPND${Date.now()}`;
  const [row] = await db
    .insert(members)
    .values({
      membershipId,
      fullName: data.fullName,
      nrcNumber: data.nrcNumber,
      dateOfBirth: data.dateOfBirth as any,
      residentialAddress: data.residentialAddress,
      phone: data.phone,
      email: data.email,
      province: data.jurisdiction.province,
      district: data.jurisdiction.district,
      constituency: data.jurisdiction.constituency,
      ward: data.jurisdiction.ward,
      branch: data.jurisdiction.branch,
      section: data.jurisdiction.section,
      status: 'Pending Section Review',
      partyCommitment: 'Unity, Work, Progress'
    })
    .returning();
  revalidatePath('/dashboard');
  return row;
}

export async function updateMember(id: string, raw: unknown) {
  const parsed = MemberUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  const data = parsed.data as any;
  const [row] = await db.update(members).set(data).where(eq(members.id, id as any)).returning();
  revalidatePath('/dashboard');
  return row;
}
