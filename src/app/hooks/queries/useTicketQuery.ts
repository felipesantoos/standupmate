/**
 * useTicketQuery - React Query Hook
 * 
 * Fetches a single ticket by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { ticketsKeys } from './useTicketsQuery';

/**
 * Hook to query a single ticket
 * 
 * @param id - Ticket ID
 * @param enabled - Whether to run the query (default: true if id is provided)
 * @returns React Query result with ticket
 */
export function useTicketQuery(id: string | undefined, enabled = true) {
  const service = diContainer.ticketService;
  
  return useQuery({
    queryKey: id ? ticketsKeys.detail(id) : ['tickets', 'detail', 'empty'],
    queryFn: async () => {
      if (!id) throw new Error('Ticket ID is required');
      return await service.getTicket(id);
    },
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1 minuto (dados específicos ficam mais tempo)
  });
}

