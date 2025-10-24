'use server';

import { db } from '@/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  eventSchema,
  eventUpdateSchema,
  eventRsvpSchema,
  type EventInput,
  type EventUpdateInput,
  type EventRsvpInput,
} from '@/lib/validations';

// Get all events
export async function getEvents(filters?: {
  status?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    let query = db.select().from(events);
    const conditions = [];

    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(events.status, filters.status));
    }

    if (filters?.province) {
      conditions.push(eq(events.province, filters.province));
    }

    if (filters?.startDate) {
      conditions.push(gte(events.eventDate, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(events.eventDate, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(events.eventDate));
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

// Get event by ID
export async function getEventById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // Get RSVPs for this event
    const rsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, id));

    return { success: true, data: { ...event, rsvps } };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

// Create new event
export async function createEvent(data: EventInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = eventSchema.parse(data);

    const [newEvent] = await db.insert(events).values({
      eventName: validatedData.eventName,
      eventType: validatedData.eventType,
      description: validatedData.description,
      eventDate: validatedData.eventDate,
      eventTime: validatedData.eventTime,
      location: validatedData.location,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      province: validatedData.province,
      district: validatedData.district,
      organizer: validatedData.organizer,
      expectedAttendees: validatedData.expectedAttendees,
      actualAttendees: validatedData.actualAttendees,
      status: validatedData.status,
    }).returning();

    revalidatePath('/dashboard');

    return { success: true, data: newEvent };
  } catch (error: any) {
    console.error('Error creating event:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create event' };
  }
}

// Update event
export async function updateEvent(id: string, data: EventUpdateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const validatedData = eventUpdateSchema.parse(data);

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: updatedEvent };
  } catch (error: any) {
    console.error('Error updating event:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to update event' };
  }
}

// Delete event
export async function deleteEvent(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    await db.delete(events).where(eq(events.id, id));

    revalidatePath('/dashboard');

    return { success: true, message: 'Event deleted successfully' };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

// Create or update RSVP
export async function createOrUpdateRsvp(data: EventRsvpInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const validatedData = eventRsvpSchema.parse(data);

    // Check if RSVP already exists
    const existingRsvp = await db.query.eventRsvps.findFirst({
      where: and(
        eq(eventRsvps.eventId, validatedData.eventId),
        eq(eventRsvps.memberId, validatedData.memberId)
      ),
    });

    let result;
    if (existingRsvp) {
      // Update existing RSVP
      [result] = await db
        .update(eventRsvps)
        .set({
          response: validatedData.response,
          notes: validatedData.notes,
          updatedAt: new Date(),
        })
        .where(eq(eventRsvps.id, existingRsvp.id))
        .returning();
    } else {
      // Create new RSVP
      [result] = await db.insert(eventRsvps).values({
        eventId: validatedData.eventId,
        memberId: validatedData.memberId,
        response: validatedData.response,
        notes: validatedData.notes,
      }).returning();
    }

    revalidatePath('/dashboard');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error creating/updating RSVP:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to create/update RSVP' };
  }
}

// Check in member for event
export async function checkInMember(eventId: string, memberId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.role?.includes('Admin')) {
      throw new Error('Unauthorized');
    }

    const rsvp = await db.query.eventRsvps.findFirst({
      where: and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.memberId, memberId)
      ),
    });

    if (!rsvp) {
      return { success: false, error: 'RSVP not found' };
    }

    await db
      .update(eventRsvps)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
      })
      .where(eq(eventRsvps.id, rsvp.id));

    revalidatePath('/dashboard');

    return { success: true, message: 'Member checked in successfully' };
  } catch (error) {
    console.error('Error checking in member:', error);
    return { success: false, error: 'Failed to check in member' };
  }
}

// Get event statistics
export async function getEventStatistics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Unauthorized');
    }

    const totalEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(events);

    const upcomingEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(
        gte(events.eventDate, new Date().toISOString().split('T')[0]),
        eq(events.status, 'Planned')
      ));

    const completedEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.status, 'Completed'));

    return {
      success: true,
      data: {
        totalEvents: totalEvents[0].count,
        upcomingEvents: upcomingEvents[0].count,
        completedEvents: completedEvents[0].count,
      },
    };
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
}
