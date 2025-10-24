'use server';

import { db } from '@/db';
import { membershipCards, members } from '@/db/schema';
import { newMembershipCardSchema } from '@/lib/validations';
import { eq, and, or, like, desc, asc, count, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createMembershipCard(formData: FormData) {
  try {
    const rawData = {
      memberId: formData.get('memberId') as string,
      cardType: formData.get('cardType') as string || 'Standard',
      issueDate: formData.get('issueDate') as string || new Date().toISOString().split('T')[0],
      expiryDate: formData.get('expiryDate') as string || '',
      qrCode: formData.get('qrCode') as string || '',
      status: formData.get('status') as string || 'Active',
    };

    const validatedData = newMembershipCardSchema.parse(rawData);

    const [newCard] = await db.insert(membershipCards).values(validatedData).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: newCard };
  } catch (error) {
    console.error('Error creating membership card:', error);
    return { success: false, error: 'Failed to create membership card' };
  }
}

export async function updateMembershipCard(id: string, formData: FormData) {
  try {
    const rawData = {
      memberId: formData.get('memberId') as string,
      cardType: formData.get('cardType') as string || 'Standard',
      issueDate: formData.get('issueDate') as string || new Date().toISOString().split('T')[0],
      expiryDate: formData.get('expiryDate') as string || '',
      qrCode: formData.get('qrCode') as string || '',
      status: formData.get('status') as string || 'Active',
    };

    const validatedData = newMembershipCardSchema.parse(rawData);

    const [updatedCard] = await db
      .update(membershipCards)
      .set(validatedData)
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error('Error updating membership card:', error);
    return { success: false, error: 'Failed to update membership card' };
  }
}

export async function deleteMembershipCard(id: string) {
  try {
    await db.delete(membershipCards).where(eq(membershipCards.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting membership card:', error);
    return { success: false, error: 'Failed to delete membership card' };
  }
}

export async function getMembershipCard(id: string) {
  try {
    const card = await db.query.membershipCards.findFirst({
      where: eq(membershipCards.id, id),
      with: {
        member: true,
      },
    });
    return { success: true, data: card };
  } catch (error) {
    console.error('Error fetching membership card:', error);
    return { success: false, error: 'Failed to fetch membership card' };
  }
}

export async function getMembershipCards(queryParams: any) {
  try {
    const { page = 1, limit = 10, search, cardType, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(members.fullName, `%${search}%`),
          like(members.membershipId, `%${search}%`),
          like(membershipCards.qrCode, `%${search}%`)
        )
      );
    }
    
    if (cardType) {
      whereConditions.push(eq(membershipCards.cardType, cardType));
    }
    
    if (status) {
      whereConditions.push(eq(membershipCards.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id))
      .where(whereClause);

    const total = totalResult.count;

    // Get cards with pagination
    const cards = await db
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
          email: members.email,
          phone: members.phone,
        }
      })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id))
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(membershipCards[sortBy as keyof typeof membershipCards]) : desc(membershipCards[sortBy as keyof typeof membershipCards]))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        cards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching membership cards:', error);
    return { success: false, error: 'Failed to fetch membership cards' };
  }
}

export async function getMembershipCardByMember(memberId: string) {
  try {
    const card = await db.query.membershipCards.findFirst({
      where: eq(membershipCards.memberId, memberId),
      with: {
        member: true,
      },
    });
    return { success: true, data: card };
  } catch (error) {
    console.error('Error fetching membership card by member:', error);
    return { success: false, error: 'Failed to fetch membership card' };
  }
}

export async function renewMembershipCard(id: string, newExpiryDate: string) {
  try {
    const [renewedCard] = await db
      .update(membershipCards)
      .set({ 
        expiryDate: newExpiryDate,
        lastRenewedAt: new Date(),
        renewalReminderSent: false,
        renewalReminderSentAt: null
      })
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: renewedCard };
  } catch (error) {
    console.error('Error renewing membership card:', error);
    return { success: false, error: 'Failed to renew membership card' };
  }
}

export async function getExpiringCards(days: number = 30) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const expiringCards = await db
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
          email: members.email,
          phone: members.phone,
        }
      })
      .from(membershipCards)
      .leftJoin(members, eq(membershipCards.memberId, members.id))
      .where(
        and(
          eq(membershipCards.status, 'Active'),
          lte(membershipCards.expiryDate, futureDateString),
          gte(membershipCards.expiryDate, new Date().toISOString().split('T')[0])
        )
      )
      .orderBy(asc(membershipCards.expiryDate));

    return { success: true, data: expiringCards };
  } catch (error) {
    console.error('Error fetching expiring cards:', error);
    return { success: false, error: 'Failed to fetch expiring cards' };
  }
}

export async function markRenewalReminderSent(id: string) {
  try {
    const [updatedCard] = await db
      .update(membershipCards)
      .set({ 
        renewalReminderSent: true,
        renewalReminderSentAt: new Date()
      })
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error('Error marking renewal reminder sent:', error);
    return { success: false, error: 'Failed to mark renewal reminder sent' };
  }
}