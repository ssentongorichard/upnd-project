'use server';

import { db } from '@/db';
import { membershipCards, members } from '@/db/schema';
import { eq, and, like, or, desc, asc, gte, lte } from 'drizzle-orm';
import { membershipCardSchema, membershipCardUpdateSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createMembershipCard(formData: FormData) {
  const rawData = {
    memberId: formData.get('memberId') as string,
    cardType: formData.get('cardType') as string,
    expiryDate: formData.get('expiryDate') as string,
  };

  const validatedData = membershipCardSchema.parse(rawData);

  try {
    // Generate QR code (in a real app, you'd use a QR code library)
    const qrCode = `UPND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [newCard] = await db.insert(membershipCards).values({
      ...validatedData,
      qrCode,
    }).returning();

    revalidatePath('/dashboard');
    return { success: true, card: newCard };
  } catch (error) {
    console.error('Error creating membership card:', error);
    return { success: false, error: 'Failed to create membership card' };
  }
}

export async function updateMembershipCard(id: string, formData: FormData) {
  const rawData = {
    cardType: formData.get('cardType') as string,
    expiryDate: formData.get('expiryDate') as string,
    status: formData.get('status') as string,
  };

  const validatedData = membershipCardUpdateSchema.parse(rawData);

  try {
    const [updatedCard] = await db
      .update(membershipCards)
      .set({
        ...validatedData,
        lastRenewedAt: new Date(),
      })
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, card: updatedCard };
  } catch (error) {
    console.error('Error updating membership card:', error);
    return { success: false, error: 'Failed to update membership card' };
  }
}

export async function deleteMembershipCard(id: string) {
  try {
    await db.delete(membershipCards).where(eq(membershipCards.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting membership card:', error);
    return { success: false, error: 'Failed to delete membership card' };
  }
}

export async function getMembershipCard(id: string) {
  try {
    const [card] = await db
      .select({
        id: membershipCards.id,
        memberId: membershipCards.memberId,
        cardType: membershipCards.cardType,
        issueDate: membershipCards.issueDate,
        expiryDate: membershipCards.expiryDate,
        qrCode: membershipCards.qrCode,
        status: membershipCards.status,
        renewalReminderSent: membershipCards.renewalReminderSent,
        renewalReminderSentAt: membershipCards.renewalReminderSentAt,
        lastRenewedAt: membershipCards.lastRenewedAt,
        createdAt: membershipCards.createdAt,
        member: {
          id: members.id,
          fullName: members.fullName,
          membershipId: members.membershipId,
          nrcNumber: members.nrcNumber,
        }
      })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id))
      .where(eq(membershipCards.id, id))
      .limit(1);

    return { success: true, card };
  } catch (error) {
    console.error('Error fetching membership card:', error);
    return { success: false, error: 'Failed to fetch membership card' };
  }
}

export async function getMembershipCards(filters?: {
  search?: string;
  cardType?: string;
  status?: string;
  memberId?: string;
  expiringSoon?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db
      .select({
        id: membershipCards.id,
        memberId: membershipCards.memberId,
        cardType: membershipCards.cardType,
        issueDate: membershipCards.issueDate,
        expiryDate: membershipCards.expiryDate,
        qrCode: membershipCards.qrCode,
        status: membershipCards.status,
        renewalReminderSent: membershipCards.renewalReminderSent,
        renewalReminderSentAt: membershipCards.renewalReminderSentAt,
        lastRenewedAt: membershipCards.lastRenewedAt,
        createdAt: membershipCards.createdAt,
        member: {
          id: members.id,
          fullName: members.fullName,
          membershipId: members.membershipId,
          nrcNumber: members.nrcNumber,
        }
      })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id));

    if (filters?.search) {
      query = query.where(
        or(
          like(members.fullName, `%${filters.search}%`),
          like(members.membershipId, `%${filters.search}%`),
          like(members.nrcNumber, `%${filters.search}%`)
        )
      );
    }

    if (filters?.cardType) {
      query = query.where(eq(membershipCards.cardType, filters.cardType));
    }

    if (filters?.status) {
      query = query.where(eq(membershipCards.status, filters.status));
    }

    if (filters?.memberId) {
      query = query.where(eq(membershipCards.memberId, filters.memberId));
    }

    if (filters?.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.where(
        and(
          lte(membershipCards.expiryDate, thirtyDaysFromNow.toISOString().split('T')[0]),
          eq(membershipCards.status, 'Active')
        )
      );
    }

    query = query.orderBy(desc(membershipCards.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const cards = await query;
    return { success: true, cards };
  } catch (error) {
    console.error('Error fetching membership cards:', error);
    return { success: false, error: 'Failed to fetch membership cards' };
  }
}

export async function updateMembershipCardStatus(id: string, status: string) {
  try {
    const [updatedCard] = await db
      .update(membershipCards)
      .set({
        status,
        lastRenewedAt: new Date(),
      })
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, card: updatedCard };
  } catch (error) {
    console.error('Error updating membership card status:', error);
    return { success: false, error: 'Failed to update membership card status' };
  }
}

export async function getMembershipCardsByMember(memberId: string) {
  try {
    const cards = await db
      .select()
      .from(membershipCards)
      .where(eq(membershipCards.memberId, memberId))
      .orderBy(desc(membershipCards.createdAt));

    return { success: true, cards };
  } catch (error) {
    console.error('Error fetching membership cards by member:', error);
    return { success: false, error: 'Failed to fetch membership cards by member' };
  }
}

export async function sendRenewalReminder(cardId: string) {
  try {
    const [updatedCard] = await db
      .update(membershipCards)
      .set({
        renewalReminderSent: true,
        renewalReminderSentAt: new Date(),
      })
      .where(eq(membershipCards.id, cardId))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, card: updatedCard };
  } catch (error) {
    console.error('Error sending renewal reminder:', error);
    return { success: false, error: 'Failed to send renewal reminder' };
  }
}