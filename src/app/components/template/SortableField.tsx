/**
 * Sortable Field Component
 * 
 * Individual field with drag handle.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field } from '@core/domain/types';
import { GripVertical, Trash2, Edit } from 'lucide-react';

interface SortableFieldProps {
  field: Field;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onRemove: (fieldId: string) => void;
  onSelect: (field: Field) => void;
}

export function SortableField({ field, onUpdate, onRemove, onSelect }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 bg-accent/50 rounded-md border border-border hover:border-primary transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-background rounded"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {field.label || 'No name'}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          {field.type} • {field.placeholder || 'No placeholder'}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={() => onSelect(field)}
        className="p-1 hover:bg-background rounded text-primary"
        title="Edit properties"
      >
        <Edit className="w-4 h-4" />
      </button>

      <button
        onClick={() => onRemove(field.id)}
        className="p-1 hover:bg-background rounded text-destructive"
        title="Remove field"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

