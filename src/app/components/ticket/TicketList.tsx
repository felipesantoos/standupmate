/**
 * Ticket List Component
 * 
 * Displays list of tickets.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketCard } from './TicketCard';
import { SkeletonList } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { FileText } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  emptyMessage?: string;
  selectedTickets?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

export function TicketList({ 
  tickets, 
  loading = false, 
  emptyMessage = 'Nenhum ticket encontrado',
  selectedTickets = [],
  onSelectionChange,
}: TicketListProps) {
  const toggleSelection = (ticketId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedTickets.includes(ticketId)) {
      onSelectionChange(selectedTickets.filter((id) => id !== ticketId));
    } else {
      onSelectionChange([...selectedTickets, ticketId]);
    }
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedTickets.length === tickets.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tickets.map((t) => t.id));
    }
  };
  if (loading) {
    return <SkeletonList count={3} />;
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No tickets found"
        description={emptyMessage}
        action={
          !onSelectionChange
            ? {
                label: 'Create First Ticket',
                onClick: () => (window.location.href = '/tickets/new'),
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All */}
      {onSelectionChange && tickets.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            checked={selectedTickets.length === tickets.length && tickets.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-muted-foreground">
            Select all ({tickets.length})
          </span>
        </div>
      )}

      {/* Tickets */}
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-start gap-3">
            {onSelectionChange && (
              <input
                type="checkbox"
                checked={selectedTickets.includes(ticket.id)}
                onChange={() => toggleSelection(ticket.id)}
                className="h-4 w-4 mt-4 rounded border-gray-300"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1">
              <TicketCard ticket={ticket} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

