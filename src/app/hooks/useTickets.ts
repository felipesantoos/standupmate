/**
 * useTickets Hook
 * 
 * Custom hook for ticket operations.
 * Following custom hooks pattern from React guides.
 */

import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import { createTicketService } from '@/lib/serviceFactory';
import { toast } from 'sonner';

interface UseTicketsResult {
  tickets: Ticket[];
  loading: boolean;
  error: Error | null;
  createTicket: (ticket: Ticket) => Promise<Ticket>;
  updateTicket: (id: string, ticket: Ticket) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  bulkUpdateTicketStatus: (ids: string[], status: TicketStatus) => Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }>;
  deleteTicket: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<Ticket>;
  markAsInProgress: (id: string) => Promise<Ticket>;
  archiveTicket: (id: string) => Promise<Ticket>;
  refresh: () => Promise<void>;
  totalCount: number;
}

/**
 * Custom hook for ticket management
 * 
 * @param filter - Optional filter for tickets
 * @param autoLoad - Auto-load tickets on mount (default: true)
 */
export function useTickets(
  filter?: TicketFilter,
  autoLoad: boolean = true
): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load tickets from service
   */
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const service = await createTicketService();
      
      // Load tickets and count in parallel
      const [ticketsList, count] = await Promise.all([
        service.listTickets(filter),
        service.countTickets(filter),
      ]);

      setTickets(ticketsList);
      setTotalCount(count);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filter)]);

  /**
   * Create new ticket
   */
  const createTicket = async (ticket: Ticket): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const created = await service.createTicket(ticket);
      
      // Add to local state
      setTickets(prev => [created, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return created;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Update existing ticket
   */
  const updateTicket = async (id: string, ticket: Ticket): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const updated = await service.updateTicket(id, ticket);
      
      // Update in local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Delete ticket
   */
  const deleteTicket = async (id: string): Promise<void> => {
    try {
      setError(null);
      const service = await createTicketService();
      await service.deleteTicket(id);
      
      // Remove from local state
      setTickets(prev => prev.filter(t => t.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Mark ticket as completed
   */
  const markAsCompleted = async (id: string): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const updated = await service.markAsCompleted(id);
      
      // Update in local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      // Don't set error state for validation errors - let UI handle them
      const error = err as Error;
      if (!error.message.includes('required fields')) {
        setError(error);
      }
      throw err;
    }
  };

  /**
   * Update ticket status (generic method)
   */
  const updateTicketStatus = async (id: string, status: TicketStatus): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const updated = await service.updateTicketStatus(id, status);
      
      // Update in local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      // Don't set error state for validation errors - let UI handle them
      const error = err as Error;
      if (!error.message.includes('required fields')) {
        setError(error);
      }
      throw err;
    }
  };

  /**
   * Bulk update ticket status
   */
  const bulkUpdateTicketStatus = async (
    ids: string[],
    status: TicketStatus
  ): Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }> => {
    try {
      setError(null);
      const service = await createTicketService();
      const result = await service.bulkUpdateTicketStatus(ids, status);
      
      // Update local state with successful updates
      if (result.successful.length > 0) {
        setTickets(prev =>
          prev.map(t => {
            const updated = result.successful.find(u => u.id === t.id);
            return updated || t;
          })
        );
      }
      
      return result;
    } catch (err) {
      // Don't set error state - bulk operations handle their own error display
      throw err;
    }
  };

  /**
   * Mark ticket as in progress
   */
  const markAsInProgress = async (id: string): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const updated = await service.markAsInProgress(id);
      
      // Update in local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Archive ticket
   */
  const archiveTicket = async (id: string): Promise<Ticket> => {
    try {
      setError(null);
      const service = await createTicketService();
      const updated = await service.archiveTicket(id);
      
      // Update in local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  /**
   * Refresh tickets
   */
  const refresh = useCallback(async () => {
    await loadTickets();
  }, [loadTickets]);

  // Auto-load on mount and when filter changes
  useEffect(() => {
    if (autoLoad) {
      loadTickets();
    }
  }, [autoLoad, loadTickets]); // Depend on both autoLoad and loadTickets to reload when filter changes

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    updateTicketStatus,
    bulkUpdateTicketStatus,
    deleteTicket,
    markAsCompleted,
    markAsInProgress,
    archiveTicket,
    refresh,
    totalCount,
  };
}

/**
 * Hook for daily standup tickets
 */
export function useDailyStandupTickets() {
  const [yesterdayTickets, setYesterdayTickets] = useState<Ticket[]>([]);
  const [todayTickets, setTodayTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const service = await createTicketService();
      const { yesterday, today } = await service.getDailyStandupTickets();

      setYesterdayTickets(yesterday);
      setTodayTickets(today);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - load only once on mount

  return {
    yesterdayTickets,
    todayTickets,
    loading,
    error,
    refresh: load,
  };
}

