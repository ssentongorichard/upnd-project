'use server';

import { db } from '@/db';
import { disciplinaryCases } from '@/db/schema';
import { newDisciplinaryCaseSchema, disciplinaryQuerySchema } from '@/lib/validations';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createDisciplinaryCase(formData: FormData) {
  try {
    const rawData = {
      caseNumber: formData.get('caseNumber') as string,
      memberId: formData.get('memberId') as string,
      violationType: formData.get('violationType') as string,
      description: formData.get('description') as string,
      severity: formData.get('severity') as string || 'Medium',
      status: formData.get('status') as string || 'Active',
      dateReported: formData.get('dateReported') as string || new Date().toISOString().split('T')[0],
      dateIncident: formData.get('dateIncident') as string || '',
      reportingOfficer: formData.get('reportingOfficer') as string,
      assignedOfficer: formData.get('assignedOfficer') as string || '',
    };

    const validatedData = newDisciplinaryCaseSchema.parse(rawData);

    const [newCase] = await db.insert(disciplinaryCases).values(validatedData).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: newCase };
  } catch (error) {
    console.error('Error creating disciplinary case:', error);
    return { success: false, error: 'Failed to create disciplinary case' };
  }
}

export async function updateDisciplinaryCase(id: string, formData: FormData) {
  try {
    const rawData = {
      caseNumber: formData.get('caseNumber') as string,
      memberId: formData.get('memberId') as string,
      violationType: formData.get('violationType') as string,
      description: formData.get('description') as string,
      severity: formData.get('severity') as string || 'Medium',
      status: formData.get('status') as string || 'Active',
      dateReported: formData.get('dateReported') as string || new Date().toISOString().split('T')[0],
      dateIncident: formData.get('dateIncident') as string || '',
      reportingOfficer: formData.get('reportingOfficer') as string,
      assignedOfficer: formData.get('assignedOfficer') as string || '',
    };

    const validatedData = newDisciplinaryCaseSchema.parse(rawData);

    const [updatedCase] = await db
      .update(disciplinaryCases)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(disciplinaryCases.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCase };
  } catch (error) {
    console.error('Error updating disciplinary case:', error);
    return { success: false, error: 'Failed to update disciplinary case' };
  }
}

export async function deleteDisciplinaryCase(id: string) {
  try {
    await db.delete(disciplinaryCases).where(eq(disciplinaryCases.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting disciplinary case:', error);
    return { success: false, error: 'Failed to delete disciplinary case' };
  }
}

export async function getDisciplinaryCase(id: string) {
  try {
    const disciplinaryCase = await db.query.disciplinaryCases.findFirst({
      where: eq(disciplinaryCases.id, id),
      with: {
        member: true,
      },
    });
    return { success: true, data: disciplinaryCase };
  } catch (error) {
    console.error('Error fetching disciplinary case:', error);
    return { success: false, error: 'Failed to fetch disciplinary case' };
  }
}

export async function getDisciplinaryCases(queryParams: any) {
  try {
    const validatedParams = disciplinaryQuerySchema.parse(queryParams);
    const { page, limit, search, severity, status, violationType, sortBy, sortOrder } = validatedParams;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(disciplinaryCases.caseNumber, `%${search}%`),
          like(disciplinaryCases.violationType, `%${search}%`),
          like(disciplinaryCases.description, `%${search}%`),
          like(disciplinaryCases.reportingOfficer, `%${search}%`),
          like(disciplinaryCases.assignedOfficer, `%${search}%`)
        )
      );
    }
    
    if (severity) {
      whereConditions.push(eq(disciplinaryCases.severity, severity));
    }
    
    if (status) {
      whereConditions.push(eq(disciplinaryCases.status, status));
    }
    
    if (violationType) {
      whereConditions.push(eq(disciplinaryCases.violationType, violationType));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(disciplinaryCases)
      .where(whereClause);

    const total = totalResult.count;

    // Get cases with pagination
    const cases = await db
      .select()
      .from(disciplinaryCases)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(disciplinaryCases[sortBy as keyof typeof disciplinaryCases]) : desc(disciplinaryCases[sortBy as keyof typeof disciplinaryCases]))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        cases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching disciplinary cases:', error);
    return { success: false, error: 'Failed to fetch disciplinary cases' };
  }
}

export async function updateDisciplinaryCaseStatus(id: string, status: string) {
  try {
    const [updatedCase] = await db
      .update(disciplinaryCases)
      .set({ status, updatedAt: new Date() })
      .where(eq(disciplinaryCases.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCase };
  } catch (error) {
    console.error('Error updating disciplinary case status:', error);
    return { success: false, error: 'Failed to update disciplinary case status' };
  }
}