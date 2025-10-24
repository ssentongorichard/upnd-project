import useSWR from 'swr';
import { getMembers, getMember } from '@/actions/members';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook for fetching members with pagination and filters
export function useMembers(queryParams: any = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/members', queryParams],
    () => getMembers(queryParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    members: data?.data?.members || [],
    pagination: data?.data?.pagination || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching a single member
export function useMember(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/members/${id}` : null,
    () => getMember(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    member: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for member statistics
export function useMemberStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/members/stats',
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