/**
 * Section Builder Component
 * 
 * Drag & drop builder for template sections.
 */

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Section, Field } from '@core/domain/types';
import { SortableSection } from './SortableSection';

interface SectionBuilderProps {
  sections: Section[];
  onSectionsReorder: (sections: Section[]) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onSectionRemove: (sectionId: string) => void;
  onFieldAdd: (sectionId: string) => void;
  onFieldUpdate: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  onFieldRemove: (sectionId: string, fieldId: string) => void;
  onFieldsReorder: (sectionId: string, fields: Field[]) => void;
  onFieldSelect: (sectionId: string, field: Field) => void;
}

export function SectionBuilder({
  sections,
  onSectionsReorder,
  onSectionUpdate,
  onSectionRemove,
  onFieldAdd,
  onFieldUpdate,
  onFieldRemove,
  onFieldsReorder,
  onFieldSelect,
}: SectionBuilderProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = [...sections];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update order property
    reordered.forEach((section, index) => {
      section.order = index;
    });

    onSectionsReorder(reordered);
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No sections yet. Click "New Section" to get started.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              onUpdate={onSectionUpdate}
              onRemove={onSectionRemove}
              onFieldAdd={onFieldAdd}
              onFieldUpdate={onFieldUpdate}
              onFieldRemove={onFieldRemove}
              onFieldsReorder={onFieldsReorder}
              onFieldSelect={onFieldSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

