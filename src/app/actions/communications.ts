'use server';

import { db } from '@/db';
import { communications, communicationRecipients, members } from '@/db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  communicationSchema,
  communicationUpdateSchema,
  type CommunicationInput,
  type CommunicationUpdateInput,
} from '@/lib/validations';

// Get all communications
export async function getCommunications(filters?: {
  status?: string;
  type?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    let query = db.select().from(communications);
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(communications.status, filters.status));
    }

    if (filters?.type) {
      conditions.push(eq(communications.type, filters.type));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(communications.createdAt));
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching communications:', error);
    return { success: false, error: 'Failed to fetch communications' };
  }
}

// Get communication by ID
export async function getCommunicationById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, id),
    });

    if (!communication) {
      return { success: false, error: 'Communication not found' };
    }

    // Get recipients
    const recipients = await db
      .select()
      .from(communicationRecipients)
      .where(eq(communicationRecipients.communicationId, id));

    return { success: true, data: { ...communication, recipients } };
  } catch (error) {
    console.error('Error fetching communication:', error);
    return { success: false, error: 'Failed to fetch communication' };
  }
}

// Create new communication
export async function createCommunication(data: CommunicationInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = communicationSchema.parse(data);

    // Get recipients based on filter
    const recipientConditions = [];
    if (validatedData.recipientFilter) {
      const filter = validatedData.recipientFilter;
      if (filter.province) recipientConditions.push(eq(members.province, filter.province));
      if (filter.district) recipientConditions.push(eq(members.district, filter.district));
      if (filter.constituency) recipientConditions.push(eq(members.constituency, filter.constituency));
      if (filter.ward) recipientConditions.push(eq(members.ward, filter.ward));
      if (filter.branch) recipientConditions.push(eq(members.branch, filter.branch));
      if (filter.section) recipientConditions.push(eq(members.section, filter.section));
      if (filter.status) recipientConditions.push(eq(members.status, filter.status));
      if (filter.membershipLevel) recipientConditions.push(eq(members.membershipLevel, filter.membershipLevel));
    }

    let recipientsQuery = db.select({ id: members.id }).from(members);
    if (recipientConditions.length > 0) {
      recipientsQuery = recipientsQuery.where(and(...recipientConditions));
    }

    const recipients = await recipientsQuery;
    const recipientsCount = recipients.length;

    // Create communication
    const [newCommunication] = await db.insert(communications).values({
      type: validatedData.type,
      subject: validatedData.subject,
      message: validatedData.message,
      recipientFilter: validatedData.recipientFilter,
      recipientsCount,
      sentBy: session.user.name || session.user.email,
      status: validatedData.status,
    }).returning();

    // Create recipient records
    if (recipients.length > 0) {
      await db.insert(communicationRecipients).values(
        recipients.map((recipient) => ({
          communicationId: newCommunication.id,
          memberId: recipient.id,
          status: 'Pending',
        }))
      );
    }

    revalidatePath('/dashboard');

    return { success: true, data: newCommunication };
  } catch (error: any) {
    console.error('Error creating communication:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create communication' };
  }
}

// Update communication
export async function updateCommunication(
  id: string,
  data: CommunicationUpdateInput
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = communicationUpdateSchema.parse(data);

    const [updatedCommunication] = await db
      .update(communications)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(communications.id, id))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedCommunication };
  } catch (error: any) {
    console.error('Error updating communication:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update communication' };
  }
}

// Send communication
export async function sendCommunication(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    // Update communication status to sending
    await db
      .update(communications)
      .set({
        status: 'Sending',
        sentAt: new Date(),
      })
      .where(eq(communications.id, id));

    // In a real application, you would implement actual sending logic here
    // For now, we'll just update the status to sent
    await db
      .update(communications)
      .set({
        status: 'Sent',
        sentCount: sql`${communications.recipientsCount}`,
      })
      .where(eq(communications.id, id));

    // Update all recipients to sent
    await db
      .update(communicationRecipients)
      .set({
        status: 'Sent',
        sentAt: new Date(),
        deliveredAt: new Date(),
      })
      .where(eq(communicationRecipients.communicationId, id));

    revalidatePath('/dashboard');

    return { success: true, message: 'Communication sent successfully' };
  } catch (error) {
    console.error('Error sending communication:', error);
    return { success: false, error: 'Failed to send communication' };
  }
}

// Delete communication
export async function deleteCommunication(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    await db.delete(communications).where(eq(communications.id, id));

    revalidatePath('/dashboard');

    return { success: true, message: 'Communication deleted successfully' };
  } catch (error) {
    console.error('Error deleting communication:', error);
    return { success: false, error: 'Failed to delete communication' };
  }
}
