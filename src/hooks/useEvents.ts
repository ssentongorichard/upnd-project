import useSWR from 'swr';
import { getEvents, getEvent, getEventRsvps } from '@/actions/events';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook for fetching events with pagination and filters
export function useEvents(queryParams: any = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/events', queryParams],
    () => getEvents(queryParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data?.data?.events || [],
    pagination: data?.data?.pagination || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching a single event
export function useEvent(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/events/${id}` : null,
    () => getEvent(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    event: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching event RSVPs
export function useEventRsvps(eventId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? `/api/events/${eventId}/rsvps` : null,
    () => getEventRsvps(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    rsvps: data?.data || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook for upcoming events
export function useUpcomingEvents(limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/events/upcoming?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data?.events || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook for event statistics
export function useEventStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/events/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    stats: data || null,
    isLoading,
    error,
    mutate,
  };
}