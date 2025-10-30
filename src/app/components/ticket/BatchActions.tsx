/**
 * Batch Actions Component
 * 
 * Toolbar for batch operations on selected tickets.
 */

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';
import { Download, Trash2, Archive, CheckCircle, X } from 'lucide-react';

interface BatchActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkComplete: () => void;
  onClearSelection: () => void;
}

export function BatchActions({
  selectedCount,
  onExport,
  onDelete,
  onArchive,
  onMarkComplete,
  onClearSelection,
}: BatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <TooltipProvider>
        <Card className="shadow-xl border-2">
          <div className="p-3 flex items-center gap-3">
            <Badge variant="secondary" className="font-normal">
              {selectedCount} selected
            </Badge>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-1">
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
                  <Button size="sm" variant="outline" onClick={onMarkComplete}>
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as completed</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onArchive}>
                    <Archive className="w-4 h-4" />
                    Archive
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive selected</TooltipContent>
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

