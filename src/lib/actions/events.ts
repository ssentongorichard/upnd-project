'use server';

import { db } from '@/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and, like, or, desc, asc, gte, lte } from 'drizzle-orm';
import { eventSchema, eventUpdateSchema, eventRsvpSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const rawData = {
    eventName: formData.get('eventName') as string,
    eventType: formData.get('eventType') as string,
    description: formData.get('description') as string,
    eventDate: formData.get('eventDate') as string,
    eventTime: formData.get('eventTime') as string,
    location: formData.get('location') as string,
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
    province: formData.get('province') as string,
    district: formData.get('district') as string,
    organizer: formData.get('organizer') as string,
    expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : undefined,
    status: formData.get('status') as string,
  };

  const validatedData = eventSchema.parse(rawData);

  try {
    const [newEvent] = await db.insert(events).values(validatedData).returning();
    revalidatePath('/dashboard');
    return { success: true, event: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  const rawData = {
    eventName: formData.get('eventName') as string,
    eventType: formData.get('eventType') as string,
    description: formData.get('description') as string,
    eventDate: formData.get('eventDate') as string,
    eventTime: formData.get('eventTime') as string,
    location: formData.get('location') as string,
    latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
    longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
    province: formData.get('province') as string,
    district: formData.get('district') as string,
    organizer: formData.get('organizer') as string,
    expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : undefined,
    actualAttendees: formData.get('actualAttendees') ? parseInt(formData.get('actualAttendees') as string) : undefined,
    status: formData.get('status') as string,
  };

  const validatedData = eventUpdateSchema.parse(rawData);

  try {
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.delete(events).where(eq(events.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function getEvent(id: string) {
  try {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    return { success: true, event };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

export async function getEvents(filters?: {
  search?: string;
  eventType?: string;
  status?: string;
  province?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(events);

    if (filters?.search) {
      query = query.where(
        or(
          like(events.eventName, `%${filters.search}%`),
          like(events.description, `%${filters.search}%`),
          like(events.location, `%${filters.search}%`)
        )
      );
    }

    if (filters?.eventType) {
      query = query.where(eq(events.eventType, filters.eventType));
    }

    if (filters?.status) {
      query = query.where(eq(events.status, filters.status));
    }

    if (filters?.province) {
      query = query.where(eq(events.province, filters.province));
    }

    if (filters?.district) {
      query = query.where(eq(events.district, filters.district));
    }

    if (filters?.startDate) {
      query = query.where(gte(events.eventDate, filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where(lte(events.eventDate, filters.endDate));
    }

    query = query.orderBy(desc(events.eventDate));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const eventsList = await query;
    return { success: true, events: eventsList };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

export async function updateEventStatus(id: string, status: string) {
  try {
    const [updatedEvent] = await db
      .update(events)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, event: updatedEvent };
  } catch (error) {
    console.error('Error updating event status:', error);
    return { success: false, error: 'Failed to update event status' };
  }
}

// Event RSVP actions
export async function createEventRsvp(formData: FormData) {
  const rawData = {
    eventId: formData.get('eventId') as string,
    memberId: formData.get('memberId') as string,
    response: formData.get('response') as string,
    notes: formData.get('notes') as string,
  };

  const validatedData = eventRsvpSchema.parse(rawData);

  try {
    const [newRsvp] = await db.insert(eventRsvps).values(validatedData).returning();
    revalidatePath('/dashboard');
    return { success: true, rsvp: newRsvp };
  } catch (error) {
    console.error('Error creating event RSVP:', error);
    return { success: false, error: 'Failed to create event RSVP' };
  }
}

export async function updateEventRsvp(id: string, formData: FormData) {
  const rawData = {
    response: formData.get('response') as string,
    notes: formData.get('notes') as string,
    checkedIn: formData.get('checkedIn') === 'true',
  };

  try {
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({
        ...rawData,
        updatedAt: new Date(),
        checkedInAt: rawData.checkedIn ? new Date() : undefined,
      })
      .where(eq(eventRsvps.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, rsvp: updatedRsvp };
  } catch (error) {
    console.error('Error updating event RSVP:', error);
    return { success: false, error: 'Failed to update event RSVP' };
  }
}

export async function getEventRsvps(eventId: string) {
  try {
    const rsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId))
      .orderBy(desc(eventRsvps.respondedAt));

    return { success: true, rsvps };
  } catch (error) {
    console.error('Error fetching event RSVPs:', error);
    return { success: false, error: 'Failed to fetch event RSVPs' };
  }
}

export async function getMemberRsvps(memberId: string) {
  try {
    const rsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.memberId, memberId))
      .orderBy(desc(eventRsvps.respondedAt));

    return { success: true, rsvps };
  } catch (error) {
    console.error('Error fetching member RSVPs:', error);
    return { success: false, error: 'Failed to fetch member RSVPs' };
  }
}