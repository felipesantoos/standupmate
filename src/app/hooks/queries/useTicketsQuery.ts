/**
 * useTicketsQuery - React Query Hook
 * 
 * Fetches tickets list with optional filter.
 * Implements server state caching pattern from Colabora guides.
 */

import { useQuery } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { TicketFilter } from '@core/services/filters/TicketFilter';

/**
 * Query key factory for tickets
 * Ensures consistent cache keys across the app
 */
export const ticketsKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketsKeys.all, 'list'] as const,
  list: (filter?: TicketFilter) => [...ticketsKeys.lists(), { filter }] as const,
  details: () => [...ticketsKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketsKeys.details(), id] as const,
};

/**
 * Hook to query tickets list
 * 
 * @param filter - Optional ticket filter
 * @returns React Query result with tickets and count
 */
export function useTicketsQuery(filter?: TicketFilter) {
  const service = diContainer.ticketService;
  
  return useQuery({
    queryKey: ticketsKeys.list(filter),
    queryFn: async () => {
      const [tickets, count] = await Promise.all([
        service.listTickets(filter),
        service.countTickets(filter),
      ]);
      return { tickets, count };
    },
    staleTime: 30 * 1000, // 30 segundos (local DB é rápido)
  });
}

