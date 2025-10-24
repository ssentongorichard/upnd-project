import useSWR from 'swr';
import { getDisciplinaryCases, getDisciplinaryCase } from '@/actions/disciplinary';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Hook for fetching disciplinary cases with pagination and filters
export function useDisciplinaryCases(queryParams: any = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/disciplinary', queryParams],
    () => getDisciplinaryCases(queryParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    cases: data?.data?.cases || [],
    pagination: data?.data?.pagination || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching a single disciplinary case
export function useDisciplinaryCase(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/disciplinary/${id}` : null,
    () => getDisciplinaryCase(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    case: data?.data || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for disciplinary case statistics
export function useDisciplinaryStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/disciplinary/stats',
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

// Hook for active disciplinary cases
export function useActiveDisciplinaryCases() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/disciplinary/active',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    cases: data?.cases || [],
    isLoading,
    error,
    mutate,
  };
}