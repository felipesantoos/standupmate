/**
 * useUpdateTicket - React Query Mutation Hook
 * 
 * Updates an existing ticket.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { Ticket } from '@core/domain/Ticket';
import { ticketsKeys } from '../queries/useTicketsQuery';

/**
 * Hook to update a ticket
 * 
 * @returns React Query mutation result
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const service = diContainer.ticketService;
  
  return useMutation({
    mutationFn: ({ id, ticket }: { id: string; ticket: Ticket }) => 
      service.updateTicket(id, ticket),
    
    onSuccess: (_, variables) => {
      // Invalidate specific ticket and lists
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to update ticket:', error);
    },
  });
}

