'use server';

import { db } from '@/db';
import { members } from '@/db/schema';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { memberSchema, memberUpdateSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMember(formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName') as string,
    nrcNumber: formData.get('nrcNumber') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
    gender: formData.get('gender') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    residentialAddress: formData.get('residentialAddress') as string,
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
    province: formData.get('province') as string,
    district: formData.get('district') as string,
    constituency: formData.get('constituency') as string,
    ward: formData.get('ward') as string,
    branch: formData.get('branch') as string,
    section: formData.get('section') as string,
    education: formData.get('education') as string,
    occupation: formData.get('occupation') as string,
    skills: formData.get('skills') ? (formData.get('skills') as string).split(',').map(s => s.trim()) : undefined,
    membershipLevel: formData.get('membershipLevel') as string,
    partyRole: formData.get('partyRole') as string,
    partyCommitment: formData.get('partyCommitment') as string,
    profileImage: formData.get('profileImage') as string,
  };

  const validatedData = memberSchema.parse(rawData);

  try {
    // Generate membership ID
    const membershipId = `UPND${Date.now().toString().slice(-6)}`;
    
    const [newMember] = await db.insert(members).values({
      ...validatedData,
      membershipId,
    }).returning();

    revalidatePath('/dashboard');
    return { success: true, member: newMember };
  } catch (error) {
    console.error('Error creating member:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function updateMember(id: string, formData: FormData) {
  const rawData = {
    fullName: formData.get('fullName') as string,
    nrcNumber: formData.get('nrcNumber') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
    gender: formData.get('gender') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    residentialAddress: formData.get('residentialAddress') as string,
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
    province: formData.get('province') as string,
    district: formData.get('district') as string,
    constituency: formData.get('constituency') as string,
    ward: formData.get('ward') as string,
    branch: formData.get('branch') as string,
    section: formData.get('section') as string,
    education: formData.get('education') as string,
    occupation: formData.get('occupation') as string,
    skills: formData.get('skills') ? (formData.get('skills') as string).split(',').map(s => s.trim()) : undefined,
    membershipLevel: formData.get('membershipLevel') as string,
    partyRole: formData.get('partyRole') as string,
    partyCommitment: formData.get('partyCommitment') as string,
    status: formData.get('status') as string,
    profileImage: formData.get('profileImage') as string,
  };

  const validatedData = memberUpdateSchema.parse(rawData);

  try {
    const [updatedMember] = await db
      .update(members)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, member: updatedMember };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteMember(id: string) {
  try {
    await db.delete(members).where(eq(members.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

export async function getMember(id: string) {
  try {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, id))
      .limit(1);

    return { success: true, member };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false, error: 'Failed to fetch member' };
  }
}

export async function getMembers(filters?: {
  search?: string;
  status?: string;
  province?: string;
  district?: string;
  membershipLevel?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(members);

    if (filters?.search) {
      query = query.where(
        or(
          like(members.fullName, `%${filters.search}%`),
          like(members.membershipId, `%${filters.search}%`),
          like(members.nrcNumber, `%${filters.search}%`),
          like(members.phone, `%${filters.search}%`)
        )
      );
    }

    if (filters?.status) {
      query = query.where(eq(members.status, filters.status));
    }

    if (filters?.province) {
      query = query.where(eq(members.province, filters.province));
    }

    if (filters?.district) {
      query = query.where(eq(members.district, filters.district));
    }

    if (filters?.membershipLevel) {
      query = query.where(eq(members.membershipLevel, filters.membershipLevel));
    }

    query = query.orderBy(desc(members.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const membersList = await query;
    return { success: true, members: membersList };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function updateMemberStatus(id: string, status: string) {
  try {
    const [updatedMember] = await db
      .update(members)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, member: updatedMember };
  } catch (error) {
    console.error('Error updating member status:', error);
    return { success: false, error: 'Failed to update member status' };
  }
}

export async function getMembersByLocation(province?: string, district?: string) {
  try {
    let query = db.select().from(members);

    if (province) {
      query = query.where(eq(members.province, province));
    }

    if (district) {
      query = query.where(eq(members.district, district));
    }

    const membersList = await query;
    return { success: true, members: membersList };
  } catch (error) {
    console.error('Error fetching members by location:', error);
    return { success: false, error: 'Failed to fetch members by location' };
  }
}