'use server';

import { db } from '@/db';
import { events, eventRsvps } from '@/db/schema';
import { newEventSchema, eventQuerySchema, newEventRsvpSchema } from '@/lib/validations';
import { eq, and, or, like, desc, asc, count, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  try {
    const rawData = {
      eventName: formData.get('eventName') as string,
      eventType: formData.get('eventType') as string,
      description: formData.get('description') as string || '',
      eventDate: formData.get('eventDate') as string,
      eventTime: formData.get('eventTime') as string || '',
      location: formData.get('location') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      province: formData.get('province') as string || '',
      district: formData.get('district') as string || '',
      organizer: formData.get('organizer') as string,
      expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : 0,
      actualAttendees: formData.get('actualAttendees') ? parseInt(formData.get('actualAttendees') as string) : 0,
      status: formData.get('status') as string || 'Planned',
    };

    const validatedData = newEventSchema.parse(rawData);

    const [newEvent] = await db.insert(events).values(validatedData).returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  try {
    const rawData = {
      eventName: formData.get('eventName') as string,
      eventType: formData.get('eventType') as string,
      description: formData.get('description') as string || '',
      eventDate: formData.get('eventDate') as string,
      eventTime: formData.get('eventTime') as string || '',
      location: formData.get('location') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
      province: formData.get('province') as string || '',
      district: formData.get('district') as string || '',
      organizer: formData.get('organizer') as string,
      expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : 0,
      actualAttendees: formData.get('actualAttendees') ? parseInt(formData.get('actualAttendees') as string) : 0,
      status: formData.get('status') as string || 'Planned',
    };

    const validatedData = newEventSchema.parse(rawData);

    const [updatedEvent] = await db
      .update(events)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.delete(events).where(eq(events.id, id));
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function getEvent(id: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });
    return { success: true, data: event };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

export async function getEvents(queryParams: any) {
  try {
    const validatedParams = eventQuerySchema.parse(queryParams);
    const { page, limit, search, eventType, status, province, district, dateFrom, dateTo, sortBy, sortOrder } = validatedParams;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(events.eventName, `%${search}%`),
          like(events.description, `%${search}%`),
          like(events.location, `%${search}%`),
          like(events.organizer, `%${search}%`)
        )
      );
    }
    
    if (eventType) {
      whereConditions.push(eq(events.eventType, eventType));
    }
    
    if (status) {
      whereConditions.push(eq(events.status, status));
    }
    
    if (province) {
      whereConditions.push(eq(events.province, province));
    }
    
    if (district) {
      whereConditions.push(eq(events.district, district));
    }
    
    if (dateFrom) {
      whereConditions.push(gte(events.eventDate, dateFrom));
    }
    
    if (dateTo) {
      whereConditions.push(lte(events.eventDate, dateTo));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(events)
      .where(whereClause);

    const total = totalResult.count;

    // Get events with pagination
    const eventsList = await db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(events[sortBy as keyof typeof events]) : desc(events[sortBy as keyof typeof events]))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data: {
        events: eventsList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

export async function createEventRsvp(formData: FormData) {
  try {
    const rawData = {
      eventId: formData.get('eventId') as string,
      memberId: formData.get('memberId') as string,
      response: formData.get('response') as string || 'Maybe',
      notes: formData.get('notes') as string || '',
    };

    const validatedData = newEventRsvpSchema.parse(rawData);

    const [newRsvp] = await db.insert(eventRsvps).values(validatedData).returning();

    revalidatePath('/dashboard');
    return { success: true, data: newRsvp };
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return { success: false, error: 'Failed to create RSVP' };
  }
}

export async function updateEventRsvp(id: string, formData: FormData) {
  try {
    const rawData = {
      response: formData.get('response') as string || 'Maybe',
      checkedIn: formData.get('checkedIn') === 'true',
      notes: formData.get('notes') as string || '',
    };

    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({ 
        response: rawData.response,
        checkedIn: rawData.checkedIn,
        notes: rawData.notes,
        updatedAt: new Date() 
      })
      .where(eq(eventRsvps.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, data: updatedRsvp };
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return { success: false, error: 'Failed to update RSVP' };
  }
}

export async function getEventRsvps(eventId: string) {
  try {
    const rsvps = await db.query.eventRsvps.findMany({
      where: eq(eventRsvps.eventId, eventId),
      with: {
        member: true,
      },
    });
    return { success: true, data: rsvps };
  } catch (error) {
    console.error('Error fetching event RSVPs:', error);
    return { success: false, error: 'Failed to fetch event RSVPs' };
  }
}