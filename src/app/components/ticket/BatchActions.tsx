/**
 * Batch Actions Component
 * 
 * Toolbar for batch operations on selected tickets.
 */

import { useState } from 'react';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Download, Trash2, Archive, CheckCircle, X, FileEdit, PlayCircle } from 'lucide-react';
import { TicketStatus } from '@core/domain/types';

interface BatchActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkComplete: () => void;
  onClearSelection: () => void;
  onStatusChange?: (status: TicketStatus) => Promise<void>;
}

export function BatchActions({
  selectedCount,
  onExport,
  onDelete,
  onArchive,
  onMarkComplete,
  onClearSelection,
  onStatusChange,
}: BatchActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (selectedCount === 0) return null;

  const handleStatusChange = async (status: string) => {
    if (!status || !onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(status as TicketStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <TooltipProvider>
        <Card className="shadow-xl border-2">
          <div className="p-3 flex items-center gap-3">
            <Badge variant="secondary" className="font-normal">
              {selectedCount} selected
            </Badge>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-2 items-center">
              {/* Status Dropdown */}
              {onStatusChange && (
                <>
                  <Select 
                    value="" 
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder={isUpdating ? "Updating..." : "Change status..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TicketStatus.DRAFT}>
                        <div className="flex items-center gap-2">
                          <FileEdit className="w-4 h-4" />
                          <span>Draft</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TicketStatus.IN_PROGRESS}>
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TicketStatus.COMPLETED}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TicketStatus.ARCHIVED}>
                        <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4" />
                          <span>Archived</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onExport}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export selected tickets</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete permanently</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onClearSelection}>
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear selection</TooltipContent>
            </Tooltip>
          </div>
        </Card>
      </TooltipProvider>
    </div>
  );
}

