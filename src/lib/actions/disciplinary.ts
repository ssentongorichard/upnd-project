'use server';

import { db } from '@/db';
import { disciplinaryCases, members } from '@/db/schema';
import { eq, and, like, or, desc, asc } from 'drizzle-orm';
import { disciplinaryCaseSchema, disciplinaryCaseUpdateSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createDisciplinaryCase(formData: FormData) {
  const rawData = {
    caseNumber: formData.get('caseNumber') as string,
    memberId: formData.get('memberId') as string,
    violationType: formData.get('violationType') as string,
    description: formData.get('description') as string,
    severity: formData.get('severity') as string,
    status: formData.get('status') as string,
    dateIncident: formData.get('dateIncident') as string,
    reportingOfficer: formData.get('reportingOfficer') as string,
    assignedOfficer: formData.get('assignedOfficer') as string,
  };

  const validatedData = disciplinaryCaseSchema.parse(rawData);

  try {
    const [newCase] = await db.insert(disciplinaryCases).values(validatedData).returning();
    revalidatePath('/dashboard');
    return { success: true, case: newCase };
  } catch (error) {
    console.error('Error creating disciplinary case:', error);
    return { success: false, error: 'Failed to create disciplinary case' };
  }
}

export async function updateDisciplinaryCase(id: string, formData: FormData) {
  const rawData = {
    caseNumber: formData.get('caseNumber') as string,
    memberId: formData.get('memberId') as string,
    violationType: formData.get('violationType') as string,
    description: formData.get('description') as string,
    severity: formData.get('severity') as string,
    status: formData.get('status') as string,
    dateIncident: formData.get('dateIncident') as string,
    reportingOfficer: formData.get('reportingOfficer') as string,
    assignedOfficer: formData.get('assignedOfficer') as string,
  };

  const validatedData = disciplinaryCaseUpdateSchema.parse(rawData);

  try {
    const [updatedCase] = await db
      .update(disciplinaryCases)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(disciplinaryCases.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, case: updatedCase };
  } catch (error) {
    console.error('Error updating disciplinary case:', error);
    return { success: false, error: 'Failed to update disciplinary case' };
  }
}

export async function deleteDisciplinaryCase(id: string) {
  try {
    await db.delete(disciplinaryCases).where(eq(disciplinaryCases.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting disciplinary case:', error);
    return { success: false, error: 'Failed to delete disciplinary case' };
  }
}

export async function getDisciplinaryCase(id: string) {
  try {
    const [disciplinaryCase] = await db
      .select({
        id: disciplinaryCases.id,
        caseNumber: disciplinaryCases.caseNumber,
        memberId: disciplinaryCases.memberId,
        violationType: disciplinaryCases.violationType,
        description: disciplinaryCases.description,
        severity: disciplinaryCases.severity,
        status: disciplinaryCases.status,
        dateReported: disciplinaryCases.dateReported,
        dateIncident: disciplinaryCases.dateIncident,
        reportingOfficer: disciplinaryCases.reportingOfficer,
        assignedOfficer: disciplinaryCases.assignedOfficer,
        createdAt: disciplinaryCases.createdAt,
        updatedAt: disciplinaryCases.updatedAt,
        member: {
          id: members.id,
          fullName: members.fullName,
          membershipId: members.membershipId,
          nrcNumber: members.nrcNumber,
        }
      })
      .from(disciplinaryCases)
      .leftJoin(members, eq(disciplinaryCases.memberId, members.id))
      .where(eq(disciplinaryCases.id, id))
      .limit(1);

    return { success: true, case: disciplinaryCase };
  } catch (error) {
    console.error('Error fetching disciplinary case:', error);
    return { success: false, error: 'Failed to fetch disciplinary case' };
  }
}

export async function getDisciplinaryCases(filters?: {
  search?: string;
  status?: string;
  severity?: string;
  violationType?: string;
  memberId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db
      .select({
        id: disciplinaryCases.id,
        caseNumber: disciplinaryCases.caseNumber,
        memberId: disciplinaryCases.memberId,
        violationType: disciplinaryCases.violationType,
        description: disciplinaryCases.description,
        severity: disciplinaryCases.severity,
        status: disciplinaryCases.status,
        dateReported: disciplinaryCases.dateReported,
        dateIncident: disciplinaryCases.dateIncident,
        reportingOfficer: disciplinaryCases.reportingOfficer,
        assignedOfficer: disciplinaryCases.assignedOfficer,
        createdAt: disciplinaryCases.createdAt,
        updatedAt: disciplinaryCases.updatedAt,
        member: {
          id: members.id,
          fullName: members.fullName,
          membershipId: members.membershipId,
          nrcNumber: members.nrcNumber,
        }
      })
      .from(disciplinaryCases)
      .leftJoin(members, eq(disciplinaryCases.memberId, members.id));

    if (filters?.search) {
      query = query.where(
        or(
          like(disciplinaryCases.caseNumber, `%${filters.search}%`),
          like(disciplinaryCases.violationType, `%${filters.search}%`),
          like(disciplinaryCases.description, `%${filters.search}%`),
          like(members.fullName, `%${filters.search}%`),
          like(members.membershipId, `%${filters.search}%`)
        )
      );
    }

    if (filters?.status) {
      query = query.where(eq(disciplinaryCases.status, filters.status));
    }

    if (filters?.severity) {
      query = query.where(eq(disciplinaryCases.severity, filters.severity));
    }

    if (filters?.violationType) {
      query = query.where(eq(disciplinaryCases.violationType, filters.violationType));
    }

    if (filters?.memberId) {
      query = query.where(eq(disciplinaryCases.memberId, filters.memberId));
    }

    query = query.orderBy(desc(disciplinaryCases.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const cases = await query;
    return { success: true, cases };
  } catch (error) {
    console.error('Error fetching disciplinary cases:', error);
    return { success: false, error: 'Failed to fetch disciplinary cases' };
  }
}

export async function updateDisciplinaryCaseStatus(id: string, status: string) {
  try {
    const [updatedCase] = await db
      .update(disciplinaryCases)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(disciplinaryCases.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, case: updatedCase };
  } catch (error) {
    console.error('Error updating disciplinary case status:', error);
    return { success: false, error: 'Failed to update disciplinary case status' };
  }
}

export async function getDisciplinaryCasesByMember(memberId: string) {
  try {
    const cases = await db
      .select()
      .from(disciplinaryCases)
      .where(eq(disciplinaryCases.memberId, memberId))
      .orderBy(desc(disciplinaryCases.createdAt));

    return { success: true, cases };
  } catch (error) {
    console.error('Error fetching disciplinary cases by member:', error);
    return { success: false, error: 'Failed to fetch disciplinary cases by member' };
  }
}