'use server';

import { db } from '@/db';
import { members } from '@/db/schema';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  memberRegistrationSchema,
  memberUpdateSchema,
  memberStatusUpdateSchema,
  type MemberRegistrationInput,
  type MemberUpdateInput,
  type MemberStatusUpdateInput,
} from '@/lib/validations';

// Helper function to generate membership ID
function generateMembershipId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `UPND${timestamp}${random}`;
}

// Get all members with optional filters
export async function getMembers(filters?: {
  status?: string;
  province?: string;
  district?: string;
  searchTerm?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    let query = db.select().from(members);
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(members.status, filters.status));
    }

    if (filters?.province) {
      conditions.push(eq(members.province, filters.province));
    }

    if (filters?.district) {
      conditions.push(eq(members.district, filters.district));
    }

    if (filters?.searchTerm) {
      conditions.push(
        or(
          like(members.fullName, `%${filters.searchTerm}%`),
          like(members.membershipId, `%${filters.searchTerm}%`),
          like(members.nrcNumber, `%${filters.searchTerm}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(members.createdAt));
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

// Get member by ID
export async function getMemberById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const member = await db.query.members.findFirst({
      where: eq(members.id, id),
    });

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    return { success: true, data: member };
  } catch (error) {
    console.error('Error fetching member:', error);
    return { success: false, error: 'Failed to fetch member' };
  }
}

// Create new member (public registration)
export async function createMember(data: MemberRegistrationInput) {
  try {
    // Validate input
    const validatedData = memberRegistrationSchema.parse(data);

    // Check if NRC already exists
    const existingMember = await db.query.members.findFirst({
      where: eq(members.nrcNumber, validatedData.nrcNumber),
    });

    if (existingMember) {
      return { success: false, error: 'NRC number already registered' };
    }

    // Generate membership ID
    const membershipId = generateMembershipId();

    // Create member
    const [newMember] = await db.insert(members).values({
      membershipId,
      fullName: validatedData.fullName,
      nrcNumber: validatedData.nrcNumber,
      dateOfBirth: validatedData.dateOfBirth,
      gender: validatedData.gender,
      phone: validatedData.phone,
      email: validatedData.email || null,
      residentialAddress: validatedData.residentialAddress,
      latitude: validatedData.latitude || null,
      longitude: validatedData.longitude || null,
      province: validatedData.province,
      district: validatedData.district,
      constituency: validatedData.constituency,
      ward: validatedData.ward,
      branch: validatedData.branch,
      section: validatedData.section,
      education: validatedData.education,
      occupation: validatedData.occupation,
      skills: validatedData.skills,
      membershipLevel: validatedData.membershipLevel,
      partyRole: validatedData.partyRole,
      partyCommitment: validatedData.partyCommitment,
      profileImage: validatedData.profileImage,
      status: 'Pending Section Review',
    }).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, data: newMember };
  } catch (error: any) {
    console.error('Error creating member:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create member' };
  }
}

// Update member
export async function updateMember(id: string, data: MemberUpdateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Validate input
    const validatedData = memberUpdateSchema.parse(data);

    // Check if member exists
    const existingMember = await db.query.members.findFirst({
      where: eq(members.id, id),
    });

    if (!existingMember) {
      return { success: false, error: 'Member not found' };
    }

    // Update member
    const [updatedMember] = await db
      .update(members)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, data: updatedMember };
  } catch (error: any) {
    console.error('Error updating member:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update member' };
  }
}

// Update member status (for approval workflow)
export async function updateMemberStatus(data: MemberStatusUpdateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Validate input
    const validatedData = memberStatusUpdateSchema.parse(data);

    // Update status
    const [updatedMember] = await db
      .update(members)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(members.id, validatedData.id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, data: updatedMember };
  } catch (error: any) {
    console.error('Error updating member status:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update member status' };
  }
}

// Bulk approve members
export async function bulkApprovemembers(memberIds: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    await db
      .update(members)
      .set({ status: 'Approved', updatedAt: new Date() })
      .where(sql`${members.id} = ANY(${memberIds})`);

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, message: `${memberIds.length} members approved` };
  } catch (error) {
    console.error('Error bulk approving members:', error);
    return { success: false, error: 'Failed to bulk approve members' };
  }
}

// Delete member
export async function deleteMember(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    await db.delete(members).where(eq(members.id, id));

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, message: 'Member deleted successfully' };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

// Get member statistics
export async function getMemberStatistics(dateRange?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Get total counts by status
    const totalMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(members);

    const approvedMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .where(eq(members.status, 'Approved'));

    const pendingMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .where(like(members.status, 'Pending%'));

    const rejectedMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .where(eq(members.status, 'Rejected'));

    const suspendedMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .where(eq(members.status, 'Suspended'));

    // Get provincial distribution
    const provincialDistribution = await db
      .select({
        province: members.province,
        count: sql<number>`count(*)`,
      })
      .from(members)
      .groupBy(members.province);

    return {
      success: true,
      data: {
        totalMembers: totalMembers[0].count,
        approvedMembers: approvedMembers[0].count,
        pendingApplications: pendingMembers[0].count,
        rejectedApplications: rejectedMembers[0].count,
        suspendedMembers: suspendedMembers[0].count,
        provincialDistribution: provincialDistribution.reduce((acc, curr) => {
          acc[curr.province] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
}
