/**
 * Ticket Card Component
 * 
 * Displays ticket in card format with modern compact design.
 */

import { memo } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { Badge } from '@app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { formatRelativeTime } from '@/utils/formatters';
import { Clock, Calendar, User, AlertCircle, FileEdit, PlayCircle, CheckCircle, Archive as ArchiveIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTagColor } from './TagColorPicker';
import { useState } from 'react';
import { toast } from 'sonner';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  onStatusChange?: (status: TicketStatus) => Promise<void>;
}

/**
 * Ticket Card Component (Memoized)
 * 
 * Dumb component - receives props, renders UI, delegates events
 * Following 08c-react-best-practices.md - Semantic HTML + ARIA
 */
const TicketCardComponent = ({ ticket, onClick, onStatusChange }: TicketCardProps) => {
  const title = ticket.getTitle();
  const description = ticket.getDescription();
  const hasPriority = ticket.metadata.priority;
  const [isUpdating, setIsUpdating] = useState(false);

  // Status badge variant (black & white + semantic green)
  const getStatusVariant = (status: TicketStatus): 'default' | 'secondary' | 'outline' => {
    if (status === TicketStatus.COMPLETED) return 'default';
    if (status === TicketStatus.IN_PROGRESS) return 'secondary';
    return 'outline';
  };

  // Status text
  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.DRAFT:
        return 'Draft';
      case TicketStatus.IN_PROGRESS:
        return 'In Progress';
      case TicketStatus.COMPLETED:
        return 'Completed';
      case TicketStatus.ARCHIVED:
        return 'Archived';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus as TicketStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      // Show specific error message for validation failures
      const errorMessage = error instanceof Error ? error.message : 'Error updating status';
      
      // Check if it's a required fields validation error
      if (errorMessage.includes('required fields')) {
        toast.error('Cannot complete: fill all required fields');
      } else {
        toast.error(errorMessage);
      }
      
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusVariant = getStatusVariant(ticket.status);
  const statusText = getStatusText(ticket.status);

  return (
    <article 
      className="group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-foreground/10 transition-all"
      aria-labelledby={`ticket-title-${ticket.id}`}
      aria-describedby={description ? `ticket-desc-${ticket.id}` : undefined}
    >
      <div className="p-4 space-y-3">
        {/* Header: Title + Status */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 
              id={`ticket-title-${ticket.id}`}
              className="text-sm font-semibold text-foreground line-clamp-1"
            >
              <Link 
                to={`/tickets/${ticket.id}`} 
                onClick={onClick}
                className="hover:underline"
                aria-label={`View ticket: ${title}`}
              >
                {title}
              </Link>
            </h3>
            {description && (
              <p 
                id={`ticket-desc-${ticket.id}`}
                className="text-sm text-muted-foreground mt-1 line-clamp-2"
              >
                {description}
              </p>
            )}
          </div>
          
          {/* Status Dropdown or Badge */}
          {onStatusChange ? (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <Select 
                value={ticket.status} 
                onValueChange={handleStatusChange}
                disabled={isUpdating}
                aria-label={`Change status for ticket: ${title}`}
              >
                <SelectTrigger 
                  className="h-7 w-[130px] text-xs"
                  aria-label="Ticket status"
                >
                  <SelectValue placeholder={statusText} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TicketStatus.DRAFT}>
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-3 h-3" />
                      <span>Draft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.IN_PROGRESS}>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-3 h-3" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.COMPLETED}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.ARCHIVED}>
                    <div className="flex items-center gap-2">
                      <ArchiveIcon className="w-3 h-3" />
                      <span>Archived</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge 
              variant={statusVariant}
              className={`shrink-0 ${
                ticket.status === TicketStatus.COMPLETED 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' 
                  : ''
              }`}
            >
              {statusText}
            </Badge>
          )}
        </header>

        {/* Main: Tags & Priority */}
        {(ticket.tags.length > 0 || hasPriority) && (
          <main className="flex items-center gap-2 flex-wrap">
            {hasPriority && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: hasPriority === 'high' ? '#EF4444' : hasPriority === 'medium' ? '#F59E0B' : 'hsl(var(--border))',
                  color: hasPriority === 'high' ? '#EF4444' : hasPriority === 'medium' ? '#F59E0B' : 'hsl(var(--muted-foreground))'
                }}
                aria-label={`Priority: ${hasPriority}`}
              >
                <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                {hasPriority}
              </Badge>
            )}
            
            {ticket.tags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs"
                aria-label={`Tag: ${tag}`}
              >
                {tag}
              </Badge>
            ))}
            
            {ticket.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs"
                aria-label={`${ticket.tags.length - 3} more tags`}
              >
                +{ticket.tags.length - 3}
              </Badge>
            )}
          </main>
        )}

        {/* Footer: Metadata */}
        <footer className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={ticket.createdAt.toISOString()}>
              {formatRelativeTime(ticket.createdAt)}
            </time>
          </div>

          {ticket.metadata.dev && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span aria-label={`Developer: ${ticket.metadata.dev}`}>
                {ticket.metadata.dev}
              </span>
            </div>
          )}

          {ticket.metadata.estimate && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span aria-label={`Estimate: ${ticket.metadata.estimate}`}>
                {ticket.metadata.estimate}
              </span>
            </div>
          )}
        </footer>
      </div>
    </article>
  );
};

/**
 * Memoized TicketCard
 * 
 * Only re-renders if ticket data actually changed
 */
export const TicketCard = memo(TicketCardComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these changed
  return (
    prevProps.ticket.id === nextProps.ticket.id &&
    prevProps.ticket.status === nextProps.ticket.status &&
    prevProps.ticket.updatedAt.getTime() === nextProps.ticket.updatedAt.getTime() &&
    prevProps.ticket.data === nextProps.ticket.data
  );
});

TicketCard.displayName = 'TicketCard';

