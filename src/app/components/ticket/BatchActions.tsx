/**
 * Batch Actions Component
 * 
 * Toolbar for batch operations on selected tickets.
 */

import { useState, useEffect, useCallback } from 'react';
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

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle if there are selected tickets
    if (selectedCount === 0) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClearSelection();
        break;
      
      case 'Delete':
      case 'Backspace':
        if (e.shiftKey) {
          e.preventDefault();
          onDelete();
        }
        break;
      
      case 'e':
      case 'E':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onExport();
        }
        break;
      
      case 'a':
      case 'A':
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          e.preventDefault();
          onArchive();
        }
        break;
      
      case 'c':
      case 'C':
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          e.preventDefault();
          onMarkComplete();
        }
        break;
    }
  }, [selectedCount, onClearSelection, onDelete, onExport, onArchive, onMarkComplete]);

  // Register keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <TooltipProvider>
        <Card className="shadow-xl border-2">
          <div 
            className="p-3 flex items-center gap-3"
            role="toolbar"
            aria-label={`Batch actions for ${selectedCount} selected tickets`}
            tabIndex={0}
          >
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onExport}
                    aria-label={`Export ${selectedCount} tickets`}
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export (Ctrl/Cmd + E)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={onDelete}
                    aria-label={`Delete ${selectedCount} tickets`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete (Shift + Delete)</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onClearSelection}
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </Card>
      </TooltipProvider>
    </div>
  );
}

