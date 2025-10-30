/**
 * Batch Actions Component
 * 
 * Toolbar for batch operations on selected tickets.
 */

import { Button } from '../ui/Button';
import { Download, Trash2, Archive, CheckCircle } from 'lucide-react';

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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <span className="text-sm font-medium">
          {selectedCount} ticket{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>

          <Button size="sm" variant="outline" onClick={onMarkComplete}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete
          </Button>

          <Button size="sm" variant="outline" onClick={onArchive}>
            <Archive className="w-4 h-4 mr-1" />
            Archive
          </Button>

          <Button size="sm" variant="outline" onClick={onDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}

