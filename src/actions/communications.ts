'use server';

import { db } from '@/db';
import { communications, communicationRecipients, members } from '@/db/schema';
import { newCommunicationSchema } from '@/lib/validations';
import { eq, and, or, like, desc, asc, count, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createCommunication(formData: FormData) {
  try {
    const rawData = {
      type: formData.get('type') as string,
      subject: formData.get('subject') as string || '',
      message: formData.get('message') as string,
      recipientFilter: formData.get('recipientFilter') ? JSON.parse(formData.get('recipientFilter') as string) : {},
      status: formData.get('status') as string || 'Draft',
      sentBy: formData.get('sentBy') as string || '',
    };

    const validatedData = newCommunicationSchema.parse(rawData);

    const [newCommunication] = await db.insert(communications).values(validatedData).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: newCommunication };
  } catch (error) {
    console.error('Error creating communication:', error);
    return { success: false, error: 'Failed to create communication' };
  }
}

export async function updateCommunication(id: string, formData: FormData) {
  try {
    const rawData = {
      type: formData.get('type') as string,
      subject: formData.get('subject') as string || '',
      message: formData.get('message') as string,
      recipientFilter: formData.get('recipientFilter') ? JSON.parse(formData.get('recipientFilter') as string) : {},
      status: formData.get('status') as string || 'Draft',
      sentBy: formData.get('sentBy') as string || '',
    };

    const validatedData = newCommunicationSchema.parse(rawData);

    const [updatedCommunication] = await db
      .update(communications)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(communications.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCommunication };
  } catch (error) {
    console.error('Error updating communication:', error);
    return { success: false, error: 'Failed to update communication' };
  }
}

export async function deleteCommunication(id: string) {
  try {
    await db.delete(communications).where(eq(communications.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting communication:', error);
    return { success: false, error: 'Failed to delete communication' };
  }
}

export async function getCommunication(id: string) {
  try {
    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, id),
    });
    return { success: true, data: communication };
  } catch (error) {
    console.error('Error fetching communication:', error);
    return { success: false, error: 'Failed to fetch communication' };
  }
}

export async function getCommunications(queryParams: any) {
  try {
    const { page = 1, limit = 10, search, type, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(communications.subject, `%${search}%`),
          like(communications.message, `%${search}%`),
          like(communications.sentBy, `%${search}%`)
        )
      );
    }
    
    if (type) {
      whereConditions.push(eq(communications.type, type));
    }
    
    if (status) {
      whereConditions.push(eq(communications.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(communications)
      .where(whereClause);

    const total = totalResult.count;

    // Get communications with pagination
    const communicationsList = await db
      .select()
      .from(communications)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(communications[sortBy as keyof typeof communications]) : desc(communications[sortBy as keyof typeof communications]))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        communications: communicationsList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching communications:', error);
    return { success: false, error: 'Failed to fetch communications' };
  }
}

export async function sendCommunication(id: string) {
  try {
    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, id),
    });

    if (!communication) {
      return { success: false, error: 'Communication not found' };
    }

    // Get recipients based on filter
    const recipientFilter = communication.recipientFilter as any;
    let whereConditions = [];

    if (recipientFilter.provinces?.length > 0) {
      whereConditions.push(inArray(members.province, recipientFilter.provinces));
    }
    if (recipientFilter.districts?.length > 0) {
      whereConditions.push(inArray(members.district, recipientFilter.districts));
    }
    if (recipientFilter.constituencies?.length > 0) {
      whereConditions.push(inArray(members.constituency, recipientFilter.constituencies));
    }
    if (recipientFilter.wards?.length > 0) {
      whereConditions.push(inArray(members.ward, recipientFilter.wards));
    }
    if (recipientFilter.branches?.length > 0) {
      whereConditions.push(inArray(members.branch, recipientFilter.branches));
    }
    if (recipientFilter.sections?.length > 0) {
      whereConditions.push(inArray(members.section, recipientFilter.sections));
    }
    if (recipientFilter.membershipLevels?.length > 0) {
      whereConditions.push(inArray(members.membershipLevel, recipientFilter.membershipLevels));
    }
    if (recipientFilter.statuses?.length > 0) {
      whereConditions.push(inArray(members.status, recipientFilter.statuses));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const recipients = await db
      .select({ id: members.id })
      .from(members)
      .where(whereClause);

    // Create communication recipients
    const recipientRecords = recipients.map(recipient => ({
      communicationId: id,
      memberId: recipient.id,
      status: 'Pending',
    }));

    if (recipientRecords.length > 0) {
      await db.insert(communicationRecipients).values(recipientRecords);
    }

    // Update communication status
    const [updatedCommunication] = await db
      .update(communications)
      .set({ 
        status: 'Sent',
        sentAt: new Date(),
        recipientsCount: recipients.length,
        sentCount: recipients.length,
        updatedAt: new Date()
      })
      .where(eq(communications.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCommunication };
  } catch (error) {
    console.error('Error sending communication:', error);
    return { success: false, error: 'Failed to send communication' };
  }
}

export async function getCommunicationRecipients(communicationId: string) {
  try {
    const recipients = await db.query.communicationRecipients.findMany({
      where: eq(communicationRecipients.communicationId, communicationId),
      with: {
        member: true,
      },
    });
    return { success: true, data: recipients };
  } catch (error) {
    console.error('Error fetching communication recipients:', error);
    return { success: false, error: 'Failed to fetch communication recipients' };
  }
}