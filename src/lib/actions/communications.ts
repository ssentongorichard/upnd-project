'use server';

import { db } from '@/db';
import { communications, communicationRecipients, members } from '@/db/schema';
import { eq, and, like, or, desc, asc, inArray } from 'drizzle-orm';
import { communicationSchema, communicationUpdateSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createCommunication(formData: FormData) {
  const rawData = {
    type: formData.get('type') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
    recipientFilter: formData.get('recipientFilter') ? JSON.parse(formData.get('recipientFilter') as string) : undefined,
    sentBy: formData.get('sentBy') as string,
  };

  const validatedData = communicationSchema.parse(rawData);

  try {
    const [newCommunication] = await db.insert(communications).values(validatedData).returning();
    revalidatePath('/dashboard');
    return { success: true, communication: newCommunication };
  } catch (error) {
    console.error('Error creating communication:', error);
    return { success: false, error: 'Failed to create communication' };
  }
}

export async function updateCommunication(id: string, formData: FormData) {
  const rawData = {
    type: formData.get('type') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
    recipientFilter: formData.get('recipientFilter') ? JSON.parse(formData.get('recipientFilter') as string) : undefined,
    status: formData.get('status') as string,
  };

  const validatedData = communicationUpdateSchema.parse(rawData);

  try {
    const [updatedCommunication] = await db
      .update(communications)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(communications.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, communication: updatedCommunication };
  } catch (error) {
    console.error('Error updating communication:', error);
    return { success: false, error: 'Failed to update communication' };
  }
}

export async function deleteCommunication(id: string) {
  try {
    await db.delete(communications).where(eq(communications.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting communication:', error);
    return { success: false, error: 'Failed to delete communication' };
  }
}

export async function getCommunication(id: string) {
  try {
    const [communication] = await db
      .select()
      .from(communications)
      .where(eq(communications.id, id))
      .limit(1);

    return { success: true, communication };
  } catch (error) {
    console.error('Error fetching communication:', error);
    return { success: false, error: 'Failed to fetch communication' };
  }
}

export async function getCommunications(filters?: {
  search?: string;
  type?: string;
  status?: string;
  sentBy?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(communications);

    if (filters?.search) {
      query = query.where(
        or(
          like(communications.subject, `%${filters.search}%`),
          like(communications.message, `%${filters.search}%`)
        )
      );
    }

    if (filters?.type) {
      query = query.where(eq(communications.type, filters.type));
    }

    if (filters?.status) {
      query = query.where(eq(communications.status, filters.status));
    }

    if (filters?.sentBy) {
      query = query.where(eq(communications.sentBy, filters.sentBy));
    }

    query = query.orderBy(desc(communications.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const communicationsList = await query;
    return { success: true, communications: communicationsList };
  } catch (error) {
    console.error('Error fetching communications:', error);
    return { success: false, error: 'Failed to fetch communications' };
  }
}

export async function sendCommunication(id: string) {
  try {
    // Get the communication
    const [communication] = await db
      .select()
      .from(communications)
      .where(eq(communications.id, id))
      .limit(1);

    if (!communication) {
      return { success: false, error: 'Communication not found' };
    }

    // Get recipients based on filter
    let recipientsQuery = db.select().from(members);
    
    if (communication.recipientFilter) {
      const filter = communication.recipientFilter as any;
      
      if (filter.provinces?.length) {
        recipientsQuery = recipientsQuery.where(inArray(members.province, filter.provinces));
      }
      
      if (filter.districts?.length) {
        recipientsQuery = recipientsQuery.where(inArray(members.district, filter.districts));
      }
      
      if (filter.membershipLevels?.length) {
        recipientsQuery = recipientsQuery.where(inArray(members.membershipLevel, filter.membershipLevels));
      }
      
      if (filter.statuses?.length) {
        recipientsQuery = recipientsQuery.where(inArray(members.status, filter.statuses));
      }
    }

    const recipients = await recipientsQuery;
    
    // Create recipient records
    const recipientRecords = recipients.map(recipient => ({
      communicationId: id,
      memberId: recipient.id,
      status: 'Pending',
    }));

    await db.insert(communicationRecipients).values(recipientRecords);

    // Update communication status
    const [updatedCommunication] = await db
      .update(communications)
      .set({
        status: 'Sent',
        recipientsCount: recipients.length,
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communications.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, communication: updatedCommunication };
  } catch (error) {
    console.error('Error sending communication:', error);
    return { success: false, error: 'Failed to send communication' };
  }
}

export async function getCommunicationRecipients(communicationId: string) {
  try {
    const recipients = await db
      .select({
        id: communicationRecipients.id,
        memberId: communicationRecipients.memberId,
        status: communicationRecipients.status,
        sentAt: communicationRecipients.sentAt,
        deliveredAt: communicationRecipients.deliveredAt,
        errorMessage: communicationRecipients.errorMessage,
        member: {
          id: members.id,
          fullName: members.fullName,
          membershipId: members.membershipId,
          phone: members.phone,
          email: members.email,
        }
      })
      .from(communicationRecipients)
      .leftJoin(members, eq(communicationRecipients.memberId, members.id))
      .where(eq(communicationRecipients.communicationId, communicationId))
      .orderBy(desc(communicationRecipients.createdAt));

    return { success: true, recipients };
  } catch (error) {
    console.error('Error fetching communication recipients:', error);
    return { success: false, error: 'Failed to fetch communication recipients' };
  }
}