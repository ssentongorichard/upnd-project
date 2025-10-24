'use server';

import { db } from '@/db';
import { membershipCards } from '@/db/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  membershipCardSchema,
  membershipCardUpdateSchema,
  type MembershipCardInput,
  type MembershipCardUpdateInput,
} from '@/lib/validations';

// Generate QR code data (in production, use a proper QR code library)
function generateQRCode(memberId: string, cardId: string): string {
  return `UPND:${memberId}:${cardId}:${Date.now()}`;
}

// Get all membership cards
export async function getMembershipCards(filters?: {
  status?: string;
  memberId?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    let query = db.select().from(membershipCards);
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(membershipCards.status, filters.status));
    }

    if (filters?.memberId) {
      conditions.push(eq(membershipCards.memberId, filters.memberId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching membership cards:', error);
    return { success: false, error: 'Failed to fetch membership cards' };
  }
}

// Get card by member ID
export async function getCardByMemberId(memberId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const card = await db.query.membershipCards.findFirst({
      where: eq(membershipCards.memberId, memberId),
    });

    if (!card) {
      return { success: false, error: 'Card not found' };
    }

    return { success: true, data: card };
  } catch (error) {
    console.error('Error fetching membership card:', error);
    return { success: false, error: 'Failed to fetch membership card' };
  }
}

// Create membership card
export async function createMembershipCard(data: MembershipCardInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = membershipCardSchema.parse(data);

    // Check if card already exists for this member
    const existingCard = await db.query.membershipCards.findFirst({
      where: eq(membershipCards.memberId, validatedData.memberId),
    });

    if (existingCard) {
      return { success: false, error: 'Card already exists for this member' };
    }

    // Calculate expiry date (2 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    const [newCard] = await db.insert(membershipCards).values({
      memberId: validatedData.memberId,
      cardType: validatedData.cardType,
      expiryDate: expiryDate.toISOString().split('T')[0],
      qrCode: '', // Will be updated after insert
      status: validatedData.status,
    }).returning();

    // Generate and update QR code
    const qrCode = generateQRCode(validatedData.memberId, newCard.id);
    const [updatedCard] = await db
      .update(membershipCards)
      .set({ qrCode })
      .where(eq(membershipCards.id, newCard.id))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedCard };
  } catch (error: any) {
    console.error('Error creating membership card:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create membership card' };
  }
}

// Update membership card
export async function updateMembershipCard(
  id: string,
  data: MembershipCardUpdateInput
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = membershipCardUpdateSchema.parse(data);

    const [updatedCard] = await db
      .update(membershipCards)
      .set(validatedData)
      .where(eq(membershipCards.id, id))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedCard };
  } catch (error: any) {
    console.error('Error updating membership card:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update membership card' };
  }
}

// Renew membership card
export async function renewMembershipCard(cardId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    // Calculate new expiry date (2 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    const [updatedCard] = await db
      .update(membershipCards)
      .set({
        expiryDate: expiryDate.toISOString().split('T')[0],
        lastRenewedAt: new Date(),
        status: 'Active',
        renewalReminderSent: false,
      })
      .where(eq(membershipCards.id, cardId))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedCard };
  } catch (error) {
    console.error('Error renewing membership card:', error);
    return { success: false, error: 'Failed to renew membership card' };
  }
}

// Get expiring cards (cards expiring within 30 days)
export async function getExpiringCards() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringCards = await db
      .select()
      .from(membershipCards)
      .where(
        and(
          lte(membershipCards.expiryDate, thirtyDaysFromNow.toISOString().split('T')[0]),
          eq(membershipCards.status, 'Active')
        )
      );

    return { success: true, data: expiringCards };
  } catch (error) {
    console.error('Error fetching expiring cards:', error);
    return { success: false, error: 'Failed to fetch expiring cards' };
  }
}

// Mark renewal reminder as sent
export async function markRenewalReminderSent(cardId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    await db
      .update(membershipCards)
      .set({
        renewalReminderSent: true,
        renewalReminderSentAt: new Date(),
      })
      .where(eq(membershipCards.id, cardId));

    revalidatePath('/dashboard');

    return { success: true, message: 'Renewal reminder marked as sent' };
  } catch (error) {
    console.error('Error marking renewal reminder as sent:', error);
    return { success: false, error: 'Failed to mark renewal reminder as sent' };
  }
}
