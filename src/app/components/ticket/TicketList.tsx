/**
 * Ticket List Component
 * 
 * Displays list of tickets.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketCard } from './TicketCard';
import { Skeleton } from '@app/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@app/components/ui/empty';
import { Checkbox } from '@app/components/ui/checkbox';
import { Label } from '@app/components/ui/label';
import { FileText } from 'lucide-react';

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
          <button
            onClick={action.onClick}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {action.label}
          </button>
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
        <div className="flex items-center gap-2 px-2">
          <Checkbox
            checked={selectedTickets.length === tickets.length && tickets.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <Label className="text-sm text-muted-foreground cursor-pointer">
            Select all ({tickets.length})
          </Label>
        </div>
      )}

      {/* Tickets */}
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-start gap-3">
            {onSelectionChange && (
              <Checkbox
                checked={selectedTickets.includes(ticket.id)}
                onCheckedChange={() => toggleSelection(ticket.id)}
                className="mt-4"
                onClick={(e: any) => e.stopPropagation()}
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

