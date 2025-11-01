/**
 * useUpdateTicketStatus - React Query Mutation Hook
 * 
 * Updates ticket status with optimistic updates.
 * Implements optimistic update pattern from Colabora guides.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { diContainer } from '@app/dicontainer/dicontainer';
import { TicketStatus } from '@core/domain/types';
import { Ticket } from '@core/domain/Ticket';
import { ticketsKeys } from '../queries/useTicketsQuery';

interface UpdateStatusVariables {
  id: string;
  status: TicketStatus;
}

/**
 * Hook to update ticket status with optimistic updates
 * 
 * @returns React Query mutation result
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  const service = diContainer.ticketService;
  
  return useMutation({
    mutationFn: ({ id, status }: UpdateStatusVariables) => 
      service.updateTicketStatus(id, status),
    
    // ✅ Optimistic update
    onMutate: async ({ id, status }: UpdateStatusVariables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ticketsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: ticketsKeys.detail(id) });
      
      // Snapshot previous values
      const previousLists = queryClient.getQueryData(ticketsKeys.lists());
      const previousDetail = queryClient.getQueryData(ticketsKeys.detail(id));
      
      // Optimistically update cache
      queryClient.setQueriesData<{ tickets: Ticket[]; count: number }>(
        { queryKey: ticketsKeys.lists() }, 
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tickets: old.tickets.map(t => {
              if (t.id === id) {
                // Create new instance with updated status
                return new Ticket(
                  t.id,
                  t.templateId,
                  t.templateVersion,
                  status,
                  t.data,
                  t.metadata,
                  t.tags,
                  t.createdAt,
                  t.updatedAt,
                  t.completedAt
                );
              }
              return t;
            }),
          };
        }
      );
      
      queryClient.setQueryData<Ticket>(
        ticketsKeys.detail(id),
        (old) => {
          if (!old) return old;
          return new Ticket(
            old.id,
            old.templateId,
            old.templateVersion,
            status,
            old.data,
            old.metadata,
            old.tags,
            old.createdAt,
            old.updatedAt,
            old.completedAt
          );
        }
      );
      
      return { previousLists, previousDetail };
    },
    
    // ✅ Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(ticketsKeys.lists(), context.previousLists);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(ticketsKeys.detail(variables.id), context.previousDetail);
      }
      console.error('Failed to update ticket status:', err);
    },
    
    // ✅ Refetch on settled
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    },
  });
}

