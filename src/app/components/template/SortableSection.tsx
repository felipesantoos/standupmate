/**
 * Sortable Section Component
 * 
 * Individual section with drag handle and field management.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, Field } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { FieldBuilder } from './FieldBuilder';

interface SortableSectionProps {
  section: Section;
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onRemove: (sectionId: string) => void;
  onFieldAdd: (sectionId: string) => void;
  onFieldUpdate: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  onFieldRemove: (sectionId: string, fieldId: string) => void;
  onFieldsReorder: (sectionId: string, fields: Field[]) => void;
  onFieldSelect: (sectionId: string, field: Field) => void;
}

export function SortableSection({
  section,
  onUpdate,
  onRemove,
  onFieldAdd,
  onFieldUpdate,
  onFieldRemove,
  onFieldsReorder,
  onFieldSelect,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={isDragging ? 'shadow-lg' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
            >
              <GripVertical className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Section Title */}
            <div className="flex-1">
              <Input
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                placeholder="Section title"
                className="font-semibold"
              />
            </div>

            {/* Actions */}
            <Button size="sm" variant="outline" onClick={() => onFieldAdd(section.id)}>
              <Plus className="w-4 h-4 mr-1" />
              Field
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(section.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <FieldBuilder
            sectionId={section.id}
            fields={section.fields}
            onFieldsReorder={(fields) => onFieldsReorder(section.id, fields)}
            onFieldUpdate={(fieldId, updates) => onFieldUpdate(section.id, fieldId, updates)}
            onFieldRemove={(fieldId) => onFieldRemove(section.id, fieldId)}
            onFieldSelect={(field) => onFieldSelect(section.id, field)}
          />

          {section.fields.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No fields in this section. Click "Field" to add.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

