/**
 * Template Builder Page
 * 
 * Visual editor for creating and editing templates.
 * Features: Drag & drop, field properties, live preview.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Template } from '@core/domain/Template';
import { Section, Field, FieldType } from '@core/domain/types';
import { useTemplates } from '@app/hooks/useTemplates';
import { toast } from 'sonner';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Spinner } from '@app/components/ui/spinner';

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
import { SectionBuilder } from '@app/components/template/SectionBuilder';
import { FieldPropertyEditor } from '@app/components/template/FieldPropertyEditor';
import { TemplatePreview } from '@app/components/template/TemplatePreview';
import { Save, ArrowLeft, Eye, EyeOff, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function TemplateBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { templates, createTemplate, updateTemplate } = useTemplates();

  const [template, setTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedField, setSelectedField] = useState<{ sectionId: string; field: Field } | null>(null);

  // Load template for editing
  useEffect(() => {
    if (isNew) {
      // Create new template
      const newTemplate = new Template(
        uuidv4(),
        'New Template',
        '',
        '1.0.0',
        false,
        [],
        new Date(),
        new Date()
      );
      setTemplate(newTemplate);
    } else {
      // Load existing template
      const existing = templates.find((t) => t.id === id);
      if (existing) {
        setTemplate(existing);
      }
    }
  }, [id, isNew, templates]);

  // Update template name
  const updateName = (name: string) => {
    if (!template) return;
    setTemplate({ ...template, name });
  };

  // Update template description
  const updateDescription = (description: string) => {
    if (!template) return;
    setTemplate({ ...template, description });
  };

  // Add new section
  const addSection = () => {
    if (!template) return;

    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      order: template.sections.length,
      fields: [],
    };

    template.addSection(newSection);
    setTemplate({ ...template });
  };

  // Update section
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!template) return;

    const sectionIndex = template.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    template.sections[sectionIndex] = {
      ...template.sections[sectionIndex],
      ...updates,
    };

    setTemplate({ ...template });
  };

  // Remove section
  const removeSection = (sectionId: string) => {
    if (!template) return;
    template.removeSection(sectionId);
    setTemplate({ ...template });
  };

  // Reorder sections
  const reorderSections = (sections: Section[]) => {
    if (!template) return;
    setTemplate({ ...template, sections });
  };

  // Add field to section
  const addField = (sectionId: string) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newField: Field = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      type: FieldType.TEXT,
      required: false,
      order: section.fields.length,
    };

    section.fields.push(newField);
    setTemplate({ ...template });
  };

  // Update field
  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    section.fields[fieldIndex] = {
      ...section.fields[fieldIndex],
      ...updates,
    };

    setTemplate({ ...template });
  };

  // Remove field
  const removeField = (sectionId: string, fieldId: string) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.fields = section.fields.filter((f) => f.id !== fieldId);
    setTemplate({ ...template });
  };

  // Reorder fields in section
  const reorderFields = (sectionId: string, fields: Field[]) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.fields = fields;
    setTemplate({ ...template });
  };

  // Save template
  const handleSave = async () => {
    if (!template) return;

    try {
      // Validate
      template.validate();

      if (isNew) {
        await createTemplate(template);
        toast.success('Template created successfully.');
        navigate('/templates');
      } else {
        await updateTemplate(template.id, template);
        toast.success('Template updated successfully.');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (!template) {
    return <PageSpinner />;
  }

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/templates')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? 'New Template' : 'Edit Template'}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Template Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  value={template.name}
                  onChange={(e) => updateName(e.target.value)}
                  placeholder="e.g. Daily Work Ticket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={template.description}
                  onChange={(e) => updateDescription(e.target.value)}
                  placeholder="Describe the purpose of this template..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sections and Fields</CardTitle>
                <Button size="sm" onClick={addSection}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Section
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SectionBuilder
                sections={template.sections}
                onSectionsReorder={reorderSections}
                onSectionUpdate={updateSection}
                onSectionRemove={removeSection}
                onFieldAdd={addField}
                onFieldUpdate={updateField}
                onFieldRemove={removeField}
                onFieldsReorder={reorderFields}
                onFieldSelect={(sectionId, field) => setSelectedField({ sectionId, field })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Field Properties or Preview */}
        <div className="lg:col-span-1">
          {showPreview ? (
            <TemplatePreview template={template} />
          ) : selectedField ? (
            <FieldPropertyEditor
              field={selectedField.field}
              onUpdate={(updates) => updateField(selectedField.sectionId, selectedField.field.id, updates)}
              onClose={() => setSelectedField(null)}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground text-sm">
                  Select a field to edit its properties
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

