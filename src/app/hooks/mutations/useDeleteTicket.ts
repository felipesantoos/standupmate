/**
 * useDeleteTicket - React Query Mutation Hook
 * 
 * Deletes a ticket.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { ticketsKeys } from '../queries/useTicketsQuery';

/**
 * Hook to delete a ticket
 * 
 * @returns React Query mutation result
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const service = diContainer.ticketService;
  
  return useMutation({
    mutationFn: (id: string) => service.deleteTicket(id),
    
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ticketsKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to delete ticket:', error);
    },
  });
}

