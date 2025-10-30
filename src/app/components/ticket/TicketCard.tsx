/**
 * Ticket Card Component
 * 
 * Displays ticket in card format with modern compact design.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { Badge } from '@app/components/ui/badge';
import { formatRelativeTime } from '@/utils/formatters';
import { Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTagColor } from './TagColorPicker';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const title = ticket.data['title'] || 'Untitled Ticket';
  const description = ticket.data['description'] || '';
  const hasPriority = ticket.metadata.priority;

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

  const statusVariant = getStatusVariant(ticket.status);
  const statusText = getStatusText(ticket.status);

  return (
    <Link to={`/tickets/${ticket.id}`} onClick={onClick}>
      <div className="group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-foreground/10 transition-all cursor-pointer">
        <div className="p-4 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            
            {/* Status Badge */}
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
          </div>

          {/* Tags & Priority Row */}
          {(ticket.tags.length > 0 || hasPriority) && (
            <div className="flex items-center gap-2 flex-wrap">
              {hasPriority && (
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: hasPriority === 'high' ? '#EF4444' : hasPriority === 'medium' ? '#F59E0B' : 'hsl(var(--border))',
                    color: hasPriority === 'high' ? '#EF4444' : hasPriority === 'medium' ? '#F59E0B' : 'hsl(var(--muted-foreground))'
                  }}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {hasPriority}
                </Badge>
              )}
              
              {ticket.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              
              {ticket.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{ticket.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(ticket.createdAt)}</span>
            </div>

            {ticket.metadata.dev && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{ticket.metadata.dev}</span>
              </div>
            )}

            {ticket.metadata.estimate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{ticket.metadata.estimate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

