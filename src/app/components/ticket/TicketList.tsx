/**
 * Ticket List Component
 * 
 * Displays list of tickets.
 * Memoized for performance optimization.
 */

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketCard } from './TicketCard';
import { Skeleton } from '@app/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@app/components/ui/empty';
import { Checkbox } from '@app/components/ui/checkbox';
import { Label } from '@app/components/ui/label';
import { Button } from '@app/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Icon className="h-12 w-12 text-muted-foreground" />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyContent>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        {action && (
          <Button onClick={action.onClick} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  emptyMessage?: string;
  selectedTickets?: string[];
  onSelectionChange?: (selected: string[]) => void;
  onStatusChange?: (ticketId: string, status: any) => Promise<void>;
}

const TicketListComponent = ({ 
  tickets, 
  loading = false, 
  emptyMessage = 'Nenhum ticket encontrado',
  selectedTickets = [],
  onSelectionChange,
  onStatusChange,
}: TicketListProps) => {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (tickets.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < tickets.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < tickets.length) {
          const ticket = tickets[focusedIndex];
          navigate(`/tickets/${ticket.id}`);
        }
        break;
      
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      
      case 'End':
        e.preventDefault();
        setFocusedIndex(tickets.length - 1);
        break;
    }
  }, [focusedIndex, tickets, navigate]);

  // Focus element when index changes
  useEffect(() => {
    if (focusedIndex >= 0 && ticketRefs.current[focusedIndex]) {
      ticketRefs.current[focusedIndex]?.focus();
      ticketRefs.current[focusedIndex]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [focusedIndex]);

  // Register keyboard listener
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    
    element.addEventListener('keydown', handleKeyDown as any);
    return () => element.removeEventListener('keydown', handleKeyDown as any);
  }, [handleKeyDown]);
  if (loading) {
    return <SkeletonList />;
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
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <Checkbox
            id="select-all"
            checked={selectedTickets.length === tickets.length && tickets.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all tickets"
            className="shrink-0"
          />
          <Label 
            htmlFor="select-all" 
            className="text-sm font-medium cursor-pointer"
          >
            Select all ({tickets.length})
          </Label>
        </div>
      )}

      {/* Tickets */}
      <div 
        ref={listRef}
        className="grid gap-4"
        role="list"
        aria-label="Ticket list"
        tabIndex={0}
      >
        {tickets.map((ticket, index) => (
          <div 
            key={ticket.id} 
            ref={el => ticketRefs.current[index] = el}
            tabIndex={index === focusedIndex ? 0 : -1}
            role="listitem"
            className={`flex items-center gap-3 group/checkbox ${
              index === focusedIndex ? 'ring-2 ring-primary ring-offset-2 rounded-xl' : ''
            }`}
          >
            {onSelectionChange && (
              <Checkbox
                id={`ticket-${ticket.id}`}
                checked={selectedTickets.includes(ticket.id)}
                onCheckedChange={() => toggleSelection(ticket.id)}
                onClick={(e: any) => e.stopPropagation()}
                aria-label={`Select ticket ${ticket.getTitle()}`}
                className="shrink-0 opacity-60 group-hover/checkbox:opacity-100 transition-opacity"
              />
            )}
            <div className="flex-1">
              <TicketCard 
                ticket={ticket} 
                onStatusChange={onStatusChange ? (status) => onStatusChange(ticket.id, status) : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Memoized TicketList
 * 
 * Only re-renders if tickets array or loading state changes
 */
export const TicketList = memo(TicketListComponent);

TicketList.displayName = 'TicketList';

