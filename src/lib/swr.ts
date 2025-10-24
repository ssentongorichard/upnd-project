import useSWR from 'swr';
import { fetcher } from './api';

// Generic SWR hook factory
export function createSWRHook<T>(endpoint: string) {
  return function useData(filters?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const url = searchParams.toString() ? `${endpoint}?${searchParams.toString()}` : endpoint;
    
    const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher);
    
    return {
      data,
      error,
      isLoading,
      mutate,
    };
  };
}

// Specific hooks for different data types
export const useMembers = createSWRHook<{ members: any[] }>('/api/members');
export const useEvents = createSWRHook<{ events: any[] }>('/api/events');
export const useDisciplinaryCases = createSWRHook<{ cases: any[] }>('/api/disciplinary-cases');
export const useCommunications = createSWRHook<{ communications: any[] }>('/api/communications');
export const useMembershipCards = createSWRHook<{ cards: any[] }>('/api/membership-cards');

// Individual item hooks
export function useMember(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/members/${id}` : null,
    fetcher
  );
  
  return {
    member: data?.member,
    error,
    isLoading,
    mutate,
  };
}

export function useEvent(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/events/${id}` : null,
    fetcher
  );
  
  return {
    event: data?.event,
    error,
    isLoading,
    mutate,
  };
}

export function useDisciplinaryCase(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/disciplinary-cases/${id}` : null,
    fetcher
  );
  
  return {
    case: data?.case,
    error,
    isLoading,
    mutate,
  };
}

export function useCommunication(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/communications/${id}` : null,
    fetcher
  );
  
  return {
    communication: data?.communication,
    error,
    isLoading,
    mutate,
  };
}

export function useMembershipCard(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/membership-cards/${id}` : null,
    fetcher
  );
  
  return {
    card: data?.card,
    error,
    isLoading,
    mutate,
  };
}

// Statistics hooks
export function useStatistics() {
  const { data, error, isLoading, mutate } = useSWR('/api/statistics', fetcher);
  
  return {
    statistics: data,
    error,
    isLoading,
    mutate,
  };
}

// Event RSVP hooks
export function useEventRsvps(eventId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? `/api/events/${eventId}/rsvps` : null,
    fetcher
  );
  
  return {
    rsvps: data?.rsvps || [],
    error,
    isLoading,
    mutate,
  };
}

export function useMemberRsvps(memberId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    memberId ? `/api/members/${memberId}/rsvps` : null,
    fetcher
  );
  
  return {
    rsvps: data?.rsvps || [],
    error,
    isLoading,
    mutate,
  };
}

// Communication recipients hook
export function useCommunicationRecipients(communicationId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    communicationId ? `/api/communications/${communicationId}/recipients` : null,
    fetcher
  );
  
  return {
    recipients: data?.recipients || [],
    error,
    isLoading,
    mutate,
  };
}