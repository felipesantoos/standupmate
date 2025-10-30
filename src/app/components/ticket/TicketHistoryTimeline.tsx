/**
 * Ticket History Timeline Component
 * 
 * Shows changelog/history of ticket edits.
 */

import { TicketChange, ChangeType } from '@core/domain/TicketHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Clock, Edit, CheckCircle, Archive, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface TicketHistoryTimelineProps {
  changes: TicketChange[];
}

export function TicketHistoryTimeline({ changes }: TicketHistoryTimelineProps) {
  const getIcon = (type: ChangeType) => {
    switch (type) {
      case ChangeType.CREATED:
        return FileText;
      case ChangeType.UPDATED:
        return Edit;
      case ChangeType.STATUS_CHANGED:
        return Clock;
      case ChangeType.COMPLETED:
        return CheckCircle;
      case ChangeType.ARCHIVED:
        return Archive;
      default:
        return Clock;
    }
  };

  const getColor = (type: ChangeType) => {
    switch (type) {
      case ChangeType.CREATED:
        return 'text-foreground';
      case ChangeType.COMPLETED:
        return 'text-green-600';
      case ChangeType.ARCHIVED:
        return 'text-muted-foreground';
      case ChangeType.STATUS_CHANGED:
        return 'text-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  if (changes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground text-sm">
            No history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change) => {
            const Icon = getIcon(change.changeType);
            const colorClass = getColor(change.changeType);
            
            return (
              <div key={change.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{change.description}</p>
                  
                  {change.field && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{change.field}:</span>{' '}
                      {change.oldValue && (
                        <>
                          <span className="line-through">{change.oldValue}</span>
                          {' → '}
                        </>
                      )}
                      <span className="text-foreground">{change.newValue}</span>
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(change.timestamp, {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

