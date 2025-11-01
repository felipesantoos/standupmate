/**
 * useCreateTicket - React Query Mutation Hook
 * 
 * Creates a new ticket.
 * Implements mutation pattern from Colabora guides.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { Ticket } from '@core/domain/Ticket';
import { ticketsKeys } from '../queries/useTicketsQuery';

/**
 * Hook to create a ticket
 * 
 * @returns React Query mutation result
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  const service = diContainer.ticketService;
  
  return useMutation({
    mutationFn: (ticket: Ticket) => service.createTicket(ticket),
    
    onSuccess: () => {
      // Invalidate all tickets queries to refetch
      queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
    },
    
    onError: (error) => {
      console.error('Failed to create ticket:', error);
    },
  });
}

