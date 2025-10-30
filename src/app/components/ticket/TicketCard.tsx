/**
 * Ticket Card Component
 * 
 * Displays ticket in card format.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { formatRelativeTime } from '@/utils/formatters';
import { Clock, Calendar, CheckCircle, Circle, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const title = ticket.data['title'] || 'Untitled Ticket';
  const description = ticket.data['description'] || '';

  // Status icon and color
  const getStatusDisplay = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.DRAFT:
        return { icon: Circle, color: 'text-gray-500', label: 'Draft' };
      case TicketStatus.IN_PROGRESS:
        return { icon: Clock, color: 'text-yellow-500', label: 'In Progress' };
      case TicketStatus.COMPLETED:
        return { icon: CheckCircle, color: 'text-green-500', label: 'Complete' };
      case TicketStatus.ARCHIVED:
        return { icon: Archive, color: 'text-gray-400', label: 'Archived' };
    }
  };

  const statusDisplay = getStatusDisplay(ticket.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <Link to={`/tickets/${ticket.id}`} onClick={onClick}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">
                {description.substring(0, 100)}
                {description.length > 100 ? '...' : ''}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-2 ${statusDisplay.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{statusDisplay.label}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatRelativeTime(ticket.createdAt)}</span>
            </div>

            {ticket.metadata.estimate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Estimate: {ticket.metadata.estimate}</span>
              </div>
            )}

            {ticket.tags.length > 0 && (
              <div className="flex gap-2">
                {ticket.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {ticket.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{ticket.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

