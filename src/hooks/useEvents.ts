import useSWR, { mutate } from 'swr';
import {
  getEvents,
  createEvent,
  updateEvent as updateEventAction,
  deleteEvent as deleteEventAction,
} from '../app/actions/events';
import type { EventInput, EventUpdateInput } from '../lib/validations';

export function useEvents(filters?: {
  status?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
}) {
  // Fetch events with SWR
  const { data: eventsData, error, isLoading } = useSWR(
    ['events', filters],
    () => getEvents(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const events = eventsData?.success ? eventsData.data : [];
  const loading = isLoading;

  const addEvent = async (eventData: any) => {
    try {
      const result = await createEvent(eventData as EventInput);

      if (result.success) {
        // Revalidate events data
        mutate(['events', filters]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updatedData: any) => {
    try {
      const result = await updateEventAction(eventId, updatedData as EventUpdateInput);

      if (result.success) {
        // Revalidate events data
        mutate(['events', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const result = await deleteEventAction(eventId);

      if (result.success) {
        // Revalidate events data
        mutate(['events', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const refreshEvents = () => {
    mutate(['events', filters]);
  };

  const getEventById = (id: string) => {
    return events.find((event: any) => event.id === id);
  };

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter((event: any) => event.eventDate >= today && event.status !== 'Cancelled');
  };

  const getEventsByProvince = (province: string) => {
    return events.filter((event: any) => event.province === province);
  };

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    getEventById,
    getUpcomingEvents,
    getEventsByProvince,
  };
}
