'use server';

import { db } from '@/db';
import { members } from '@/db/schema';
import { newMemberSchema, memberQuerySchema } from '@/lib/validations';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMember(formData: FormData) {
  try {
    const rawData = {
      membershipId: formData.get('membershipId') as string,
      fullName: formData.get('fullName') as string,
      nrcNumber: formData.get('nrcNumber') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as string || 'Male',
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || '',
      residentialAddress: formData.get('residentialAddress') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      province: formData.get('province') as string,
      district: formData.get('district') as string,
      constituency: formData.get('constituency') as string,
      ward: formData.get('ward') as string,
      branch: formData.get('branch') as string,
      section: formData.get('section') as string,
      education: formData.get('education') as string || '',
      occupation: formData.get('occupation') as string || '',
      skills: formData.get('skills') ? (formData.get('skills') as string).split(',').map(s => s.trim()) : [],
      membershipLevel: formData.get('membershipLevel') as string || 'General',
      partyRole: formData.get('partyRole') as string || '',
      partyCommitment: formData.get('partyCommitment') as string || '',
      status: formData.get('status') as string || 'Pending Section Review',
      profileImage: formData.get('profileImage') as string || '',
    };

    const validatedData = newMemberSchema.parse(rawData);

    const [newMember] = await db.insert(members).values(validatedData).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: newMember };
  } catch (error) {
    console.error('Error creating member:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function updateMember(id: string, formData: FormData) {
  try {
    const rawData = {
      membershipId: formData.get('membershipId') as string,
      fullName: formData.get('fullName') as string,
      nrcNumber: formData.get('nrcNumber') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as string || 'Male',
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || '',
      residentialAddress: formData.get('residentialAddress') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      province: formData.get('province') as string,
      district: formData.get('district') as string,
      constituency: formData.get('constituency') as string,
      ward: formData.get('ward') as string,
      branch: formData.get('branch') as string,
      section: formData.get('section') as string,
      education: formData.get('education') as string || '',
      occupation: formData.get('occupation') as string || '',
      skills: formData.get('skills') ? (formData.get('skills') as string).split(',').map(s => s.trim()) : [],
      membershipLevel: formData.get('membershipLevel') as string || 'General',
      partyRole: formData.get('partyRole') as string || '',
      partyCommitment: formData.get('partyCommitment') as string || '',
      status: formData.get('status') as string || 'Pending Section Review',
      profileImage: formData.get('profileImage') as string || '',
    };

    const validatedData = newMemberSchema.parse(rawData);

    const [updatedMember] = await db
      .update(members)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedMember };
  } catch (error) {
    console.error('Error updating member:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteMember(id: string) {
  try {
    await db.delete(members).where(eq(members.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

export async function getMember(id: string) {
  try {
    const member = await db.query.members.findFirst({
      where: eq(members.id, id),
    });
    return { success: true, data: member };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false, error: 'Failed to fetch member' };
  }
}

export async function getMembers(queryParams: any) {
  try {
    const validatedParams = memberQuerySchema.parse(queryParams);
    const { page, limit, search, status, province, district, membershipLevel, sortBy, sortOrder } = validatedParams;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(members.fullName, `%${search}%`),
          like(members.membershipId, `%${search}%`),
          like(members.nrcNumber, `%${search}%`),
          like(members.phone, `%${search}%`)
        )
      );
    }
    
    if (status) {
      whereConditions.push(eq(members.status, status));
    }
    
    if (province) {
      whereConditions.push(eq(members.province, province));
    }
    
    if (district) {
      whereConditions.push(eq(members.district, district));
    }
    
    if (membershipLevel) {
      whereConditions.push(eq(members.membershipLevel, membershipLevel));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(members)
      .where(whereClause);

    const total = totalResult.count;

    // Get members with pagination
    const membersList = await db
      .select()
      .from(members)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(members[sortBy as keyof typeof members]) : desc(members[sortBy as keyof typeof members]))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        members: membersList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function updateMemberStatus(id: string, status: string) {
  try {
    const [updatedMember] = await db
      .update(members)
      .set({ status, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedMember };
  } catch (error) {
    console.error('Error updating member status:', error);
    return { success: false, error: 'Failed to update member status' };
  }
}