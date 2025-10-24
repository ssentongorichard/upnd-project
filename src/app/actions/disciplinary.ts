'use server';

import { db } from '@/db';
import { disciplinaryCases } from '@/db/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  disciplinaryCaseSchema,
  disciplinaryCaseUpdateSchema,
  type DisciplinaryCaseInput,
  type DisciplinaryCaseUpdateInput,
} from '@/lib/validations';

// Helper function to generate case number
function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `DC${year}${timestamp}`;
}

// Get all disciplinary cases
export async function getDisciplinaryCases(filters?: {
  status?: string;
  severity?: string;
  memberId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    let query = db.select().from(disciplinaryCases);
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(disciplinaryCases.status, filters.status));
    }

    if (filters?.severity) {
      conditions.push(eq(disciplinaryCases.severity, filters.severity));
    }

    if (filters?.memberId) {
      conditions.push(eq(disciplinaryCases.memberId, filters.memberId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(disciplinaryCases.createdAt));
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching disciplinary cases:', error);
    return { success: false, error: 'Failed to fetch disciplinary cases' };
  }
}

// Get disciplinary case by ID
export async function getDisciplinaryCaseById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const disciplinaryCase = await db.query.disciplinaryCases.findFirst({
      where: eq(disciplinaryCases.id, id),
    });

    if (!disciplinaryCase) {
      return { success: false, error: 'Case not found' };
    }

    return { success: true, data: disciplinaryCase };
  } catch (error) {
    console.error('Error fetching disciplinary case:', error);
    return { success: false, error: 'Failed to fetch disciplinary case' };
  }
}

// Create new disciplinary case
export async function createDisciplinaryCase(data: DisciplinaryCaseInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = disciplinaryCaseSchema.parse(data);
    const caseNumber = generateCaseNumber();

    const [newCase] = await db.insert(disciplinaryCases).values({
      caseNumber,
      memberId: validatedData.memberId,
      violationType: validatedData.violationType,
      description: validatedData.description,
      severity: validatedData.severity,
      dateIncident: validatedData.dateIncident,
      reportingOfficer: validatedData.reportingOfficer,
      assignedOfficer: validatedData.assignedOfficer,
      status: validatedData.status,
    }).returning();

    revalidatePath('/dashboard');

    return { success: true, data: newCase };
  } catch (error: any) {
    console.error('Error creating disciplinary case:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create disciplinary case' };
  }
}

// Update disciplinary case
export async function updateDisciplinaryCase(
  id: string,
  data: DisciplinaryCaseUpdateInput
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = disciplinaryCaseUpdateSchema.parse(data);

    const [updatedCase] = await db
      .update(disciplinaryCases)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(disciplinaryCases.id, id))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedCase };
  } catch (error: any) {
    console.error('Error updating disciplinary case:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update disciplinary case' };
  }
}

// Delete disciplinary case
export async function deleteDisciplinaryCase(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'National Admin') {
      throw new Error('Unauthorized');
    }

    await db.delete(disciplinaryCases).where(eq(disciplinaryCases.id, id));

    revalidatePath('/dashboard');

    return { success: true, message: 'Disciplinary case deleted successfully' };
  } catch (error) {
    console.error('Error deleting disciplinary case:', error);
    return { success: false, error: 'Failed to delete disciplinary case' };
  }
}

// Get cases by member ID
export async function getCasesByMemberId(memberId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const cases = await db
      .select()
      .from(disciplinaryCases)
      .where(eq(disciplinaryCases.memberId, memberId))
      .orderBy(desc(disciplinaryCases.createdAt));

    return { success: true, data: cases };
  } catch (error) {
    console.error('Error fetching member cases:', error);
    return { success: false, error: 'Failed to fetch member cases' };
  }
}
