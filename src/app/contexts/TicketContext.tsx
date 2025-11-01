/**
 * Ticket Context - Primary Adapter
 * 
 * Connects UI with TicketService following Hexagonal Architecture.
 * Pattern from Colabora guides: Context as Primary Adapter.
 * 
 * Responsibilities:
 * - Manage UI state (loading, error)
 * - Delegate ALL business operations to TicketService
 * - Expose data and actions to UI components
 * 
 * Does NOT contain business logic - only orchestrates service calls.
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import { diContainer } from '@app/dicontainer/dicontainer';

/**
 * Ticket Context Type
 * 
 * Following pattern: State + Actions (no setters)
 */
interface TicketContextType {
  // UI State
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  
  // Actions (delegate to service)
  fetchTickets: (filter?: TicketFilter) => Promise<void>;
  getTicket: (id: string) => Promise<void>;
  createTicket: (ticket: Ticket) => Promise<Ticket>;
  updateTicket: (id: string, ticket: Ticket) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<Ticket>;
  markAsInProgress: (id: string) => Promise<Ticket>;
  archiveTicket: (id: string) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  bulkUpdateTicketStatus: (ids: string[], status: TicketStatus) => Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }>;
  clearError: () => void;
  clearSelectedTicket: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

/**
 * Ticket Provider - Primary Adapter
 * 
 * Connects UI with TicketService via DI Container.
 */
export function TicketProvider({ children }: { children: ReactNode }) {
  // UI State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get service from DI Container (synchronous)
  const service = diContainer.ticketService;

  /**
   * Fetch tickets with optional filter
   */
  const fetchTickets = useCallback(async (filter?: TicketFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      // Delegate to service
      const [ticketsList, count] = await Promise.all([
        service.listTickets(filter),
        service.countTickets(filter),
      ]);
      
      setTickets(ticketsList);
      setTotalCount(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Get single ticket by ID
   */
  const getTicket = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const ticket = await service.getTicket(id);
      setSelectedTicket(ticket);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading ticket';
      setError(errorMessage);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Create new ticket
   */
  const createTicket = useCallback(async (ticket: Ticket): Promise<Ticket> => {
    setError(null);
    
    try {
      const created = await service.createTicket(ticket);
      
      // Update local state
      setTickets(prev => [created, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return created;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating ticket';
      setError(errorMessage);
      console.error('Error creating ticket:', err);
      throw err; // Re-throw for UI to handle
    }
  }, [service]);

  /**
   * Update existing ticket
   */
  const updateTicket = useCallback(async (id: string, ticket: Ticket): Promise<Ticket> => {
    setError(null);
    
    try {
      const updated = await service.updateTicket(id, ticket);
      
      // Update local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket?.id === id) {
        setSelectedTicket(updated);
      }
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating ticket';
      setError(errorMessage);
      console.error('Error updating ticket:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Delete ticket
   */
  const deleteTicket = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await service.deleteTicket(id);
      
      // Update local state
      setTickets(prev => prev.filter(t => t.id !== id));
      setTotalCount(prev => prev - 1);
      
      // Clear selected ticket if it's the one being deleted
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting ticket';
      setError(errorMessage);
      console.error('Error deleting ticket:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Mark ticket as completed
   */
  const markAsCompleted = useCallback(async (id: string): Promise<Ticket> => {
    setError(null);
    
    try {
      const updated = await service.markAsCompleted(id);
      
      // Update local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      if (selectedTicket?.id === id) {
        setSelectedTicket(updated);
      }
      
      return updated;
    } catch (err) {
      // Don't set error state for validation errors - let UI handle them
      const error = err as Error;
      if (!error.message.includes('required fields')) {
        setError(error.message);
      }
      console.error('Error marking ticket as completed:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Mark ticket as in progress
   */
  const markAsInProgress = useCallback(async (id: string): Promise<Ticket> => {
    setError(null);
    
    try {
      const updated = await service.markAsInProgress(id);
      
      // Update local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      if (selectedTicket?.id === id) {
        setSelectedTicket(updated);
      }
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating ticket status';
      setError(errorMessage);
      console.error('Error marking ticket as in progress:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Archive ticket
   */
  const archiveTicket = useCallback(async (id: string): Promise<Ticket> => {
    setError(null);
    
    try {
      const updated = await service.archiveTicket(id);
      
      // Update local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      if (selectedTicket?.id === id) {
        setSelectedTicket(updated);
      }
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error archiving ticket';
      setError(errorMessage);
      console.error('Error archiving ticket:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Update ticket status (generic)
   */
  const updateTicketStatus = useCallback(async (id: string, status: TicketStatus): Promise<Ticket> => {
    setError(null);
    
    try {
      const updated = await service.updateTicketStatus(id, status);
      
      // Update local state
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      
      if (selectedTicket?.id === id) {
        setSelectedTicket(updated);
      }
      
      return updated;
    } catch (err) {
      // Don't set error state for validation errors - let UI handle them
      const error = err as Error;
      if (!error.message.includes('required fields')) {
        setError(error.message);
      }
      console.error('Error updating ticket status:', err);
      throw err;
    }
  }, [service, selectedTicket]);

  /**
   * Bulk update ticket status
   */
  const bulkUpdateTicketStatus = useCallback(async (
    ids: string[],
    status: TicketStatus
  ): Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }> => {
    setError(null);
    
    try {
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
      const errorMessage = err instanceof Error ? err.message : 'Error bulk updating tickets';
      setError(errorMessage);
      console.error('Error bulk updating tickets:', err);
      throw err;
    }
  }, [service]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear selected ticket
   */
  const clearSelectedTicket = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  // Load initial tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []); // Empty deps - load only once

  return (
    <TicketContext.Provider
      value={{
        tickets,
        selectedTicket,
        loading,
        error,
        totalCount,
        fetchTickets,
        getTicket,
        createTicket,
        updateTicket,
        deleteTicket,
        markAsCompleted,
        markAsInProgress,
        archiveTicket,
        updateTicketStatus,
        bulkUpdateTicketStatus,
        clearError,
        clearSelectedTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

/**
 * Hook to consume Ticket Context
 * 
 * Use this hook in components to access ticket operations.
 */
export function useTicketContext() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketContext must be used within TicketProvider');
  }
  return context;
}

