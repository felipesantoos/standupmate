/**
 * Ticket Context
 * 
 * Global state management for tickets.
 * Following Context API pattern from guides.
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';

interface TicketContextType {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  filter: TicketFilter;
  setFilter: (filter: TicketFilter) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<TicketFilter>(new TicketFilter());
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        setTickets,
        selectedTicket,
        setSelectedTicket,
        filter,
        setFilter,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTicketContext() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketContext must be used within TicketProvider');
  }
  return context;
}

