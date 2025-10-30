/**
 * Ticket Card Component
 * 
 * Displays ticket in card format.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
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

  // Status badge variant
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.DRAFT:
        return { variant: 'secondary' as const, icon: Circle, label: 'Draft' };
      case TicketStatus.IN_PROGRESS:
        return { variant: 'default' as const, icon: Clock, label: 'In Progress' };
      case TicketStatus.COMPLETED:
        return { variant: 'outline' as const, icon: CheckCircle, label: 'Complete' };
      case TicketStatus.ARCHIVED:
        return { variant: 'secondary' as const, icon: Archive, label: 'Archived' };
    }
  };

  const statusBadge = getStatusBadge(ticket.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Link to={`/tickets/${ticket.id}`} onClick={onClick}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {description}
              </CardDescription>
            </div>
            <Badge variant={statusBadge.variant} className="flex items-center gap-1 shrink-0">
              <StatusIcon className="w-3 h-3" />
              <span>{statusBadge.label}</span>
            </Badge>
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
              <div className="flex gap-1.5 flex-wrap">
                {ticket.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {ticket.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{ticket.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

