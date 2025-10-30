/**
 * Field Builder Component
 * 
 * Drag & drop builder for fields within a section.
 */

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Field } from '@core/domain/types';
import { SortableField } from './SortableField';

interface FieldBuilderProps {
  sectionId: string;
  fields: Field[];
  onFieldsReorder: (fields: Field[]) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldSelect: (field: Field) => void;
}

export function FieldBuilder({
  sectionId,
  fields,
  onFieldsReorder,
  onFieldUpdate,
  onFieldRemove,
  onFieldSelect,
}: FieldBuilderProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    const reordered = [...fields];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update order property
    reordered.forEach((field, index) => {
      field.order = index;
    });

    onFieldsReorder(reordered);
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              onUpdate={onFieldUpdate}
              onRemove={onFieldRemove}
              onSelect={onFieldSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

