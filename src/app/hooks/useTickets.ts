/**
 * useTickets Hook
 * 
 * Simple hook that consumes TicketContext.
 * Following Hexagonal Architecture pattern from Colabora guides.
 * 
 * All business logic is in TicketContext (Primary Adapter).
 * This hook is just a convenient accessor.
 */

import { useTicketContext } from '@app/contexts/TicketContext';

/**
 * Hook to access Ticket Context
 * 
 * Simple wrapper around useTicketContext for convenience.
 * All operations are delegated to the Context (Primary Adapter).
 * 
 * @returns TicketContext value
 * @throws Error if used outside TicketProvider
 */
export function useTickets() {
  return useTicketContext();
}

/**
 * Hook for daily standup tickets
 * 
 * Specialized hook for fetching daily standup data.
 * Uses TicketService directly via DI Container.
 */
import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { diContainer } from '@app/dicontainer/dicontainer';

export function useDailyStandupTickets() {
  const [yesterdayTickets, setYesterdayTickets] = useState<Ticket[]>([]);
  const [todayTickets, setTodayTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get service from DI Container
  const service = diContainer.ticketService;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { yesterday, today } = await service.getDailyStandupTickets();

      setYesterdayTickets(yesterday);
      setTodayTickets(today);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    load();
  }, []); // Empty deps - load only once on mount

  return {
    yesterdayTickets,
    todayTickets,
    loading,
    error,
    refresh: load,
  };
}

