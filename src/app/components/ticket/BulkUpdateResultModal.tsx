/**
 * Bulk Update Result Modal Component
 * 
 * Shows the results of bulk ticket status updates,
 * displaying which tickets failed and why.
 */

import { Ticket } from '@core/domain/Ticket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { ScrollArea } from '@app/components/ui/scroll-area';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BulkUpdateResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  failed: Array<{ id: string; ticket: Ticket; error: string }>;
}

export function BulkUpdateResultModal({
  isOpen,
  onClose,
  failed,
}: BulkUpdateResultModalProps) {
  const navigate = useNavigate();

  const handleEditTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Some tickets could not be updated
          </DialogTitle>
          <DialogDescription>
            {failed.length} {failed.length === 1 ? 'ticket failed' : 'tickets failed'} to update.
            Check the required fields and try again.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-3">
            {failed.map(({ id, ticket, error }) => (
              <Alert key={id} variant="destructive">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1 truncate">
                      {ticket.getTitle() || 'No title'}
                    </div>
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTicket(id)}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

