/**
 * Template Builder Page
 * 
 * Visual editor for creating and editing templates.
 * Features: Drag & drop, field properties, live preview.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
import { TemplatePreviewModal } from '@app/components/template/TemplatePreviewModal';
import { Save, ArrowLeft, Eye, EyeOff, Plus, Maximize2, GitBranch, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';

/**
 * Get recommended fields for a new template
 * 
 * The system auto-detects special fields using smart matching:
 * 
 * TITLE FIELDS (auto-detected by Ticket.getTitle()):
 * - 'title' ✅ (preferred) or any field containing 'title', 'titulo', 'nome'
 * - Falls back to the first non-empty text field if no title field found
 * 
 * DESCRIPTION FIELDS (auto-detected by Ticket.getDescription()):
 * - 'description' ✅ (preferred) or any field containing 'description', 'descricao', 'details'
 * 
 * BLOCKER FIELDS (auto-detected by Ticket.getBlocker()):
 * - 'blockers' ✅ (preferred) or any field containing 'blocker', 'impediment', 'bloqueador'
 * 
 * The system uses intelligent matching:
 * 1. First tries exact matches (case-sensitive)
 * 2. Then tries partial matches (case-insensitive)
 * 3. Falls back to sensible defaults
 * 
 * These auto-detected fields appear in:
 * - Dashboard Daily Standup Card
 * - Ticket List & Cards
 * - Export/Copy functions
 * - All reports
 * 
 * You can use any field IDs you want - the system will find them automatically!
 */
function getRecommendedFields(): Field[] {
  return [
    {
      id: 'title', // ✅ Recognized system-wide
      label: 'Title',
      type: FieldType.TEXT,
      required: true,
      placeholder: 'Enter a clear, concise title',
      order: 0,
      validation: {
        minLength: 3,
        maxLength: 200,
      },
    },
    {
      id: 'description', // ✅ Recognized system-wide
      label: 'Description',
      type: FieldType.MARKDOWN,
      required: false,
      placeholder: 'Describe what needs to be done and why...',
      order: 1,
      validation: {
        minLength: 10,
      },
    },
    {
      id: 'type', // Common field for categorization
      label: 'Type',
      type: FieldType.SELECT,
      required: false,
      order: 2,
      options: ['Feature', 'Bug', 'Task', 'Documentation', 'Investigation'],
    },
    {
      id: 'priority', // Common field, stored in metadata
      label: 'Priority',
      type: FieldType.SELECT,
      required: false,
      order: 3,
      options: ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'],
    },
    {
      id: 'blockers', // ✅ Recognized system-wide
      label: 'Blockers',
      type: FieldType.TEXTAREA,
      required: false,
      placeholder: 'List any blockers or impediments...',
      order: 4,
    },
    {
      id: 'status',
      label: 'Status',
      type: FieldType.SELECT,
      required: false,
      order: 5,
      options: ['📋 To Do', '🚧 In Progress', '👀 In Review', '✅ Done', '🚫 Blocked'],
    },
    {
      id: 'assignee',
      label: 'Assignee',
      type: FieldType.TEXT,
      required: false,
      placeholder: 'Who is responsible for this?',
      order: 6,
    },
    {
      id: 'due_date',
      label: 'Due Date',
      type: FieldType.DATE,
      required: false,
      order: 7,
    },
    {
      id: 'estimated_hours',
      label: 'Estimated Hours',
      type: FieldType.NUMBER,
      required: false,
      placeholder: 'Estimated time to complete',
      order: 8,
      validation: {
        min: 0,
      },
    },
  ];
}

/**
 * Get recommended starter section with common fields
 */
function getRecommendedSection(): Section {
  return {
    id: uuidv4(),
    title: 'Ticket Information',
    order: 0,
    fields: getRecommendedFields(),
  };
}

export function TemplateBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { templates, createTemplate, updateTemplate, canEdit, createNewVersion } = useTemplates();

  const [template, setTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedField, setSelectedField] = useState<{ sectionId: string; field: Field } | null>(null);
  const [canEditTemplate, setCanEditTemplate] = useState<boolean>(true);
  const [checkingEditPermission, setCheckingEditPermission] = useState<boolean>(false);

  // Load template for editing
  useEffect(() => {
    if (isNew) {
      // Create new template with recommended fields
      const newTemplate = new Template(
        uuidv4(),
        'New Template',
        'Customize this template for your workflow',
        '1.0.0',
        false,
        [getRecommendedSection()], // Start with recommended fields
        new Date(),
        new Date()
      );
      setTemplate(newTemplate);
      setCanEditTemplate(true);
    } else {
      // Load existing template
      const existing = templates.find((t) => t.id === id);
      if (existing && id) {
        setTemplate(existing);
        
        // Check if template can be edited
        checkEditPermission(id);
      }
    }
  }, [id, isNew, templates]);

  // Check edit permission for existing template
  const checkEditPermission = async (templateId: string) => {
    try {
      setCheckingEditPermission(true);
      const canEditResult = await canEdit(templateId);
      setCanEditTemplate(canEditResult);
    } catch (error) {
      console.error('Error checking edit permission:', error);
      setCanEditTemplate(false);
    } finally {
      setCheckingEditPermission(false);
    }
  };

  // Update template name
  const updateName = (name: string) => {
    if (!template) return;
    const updated = new Template(
      template.id,
      name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
  };

  // Update template description
  const updateDescription = (description: string) => {
    if (!template) return;
    const updated = new Template(
      template.id,
      template.name,
      description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
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
    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
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

    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
  };

  // Remove section
  const removeSection = (sectionId: string) => {
    if (!template) return;
    template.removeSection(sectionId);
    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
  };

  // Reorder sections
  const reorderSections = (sections: Section[]) => {
    if (!template) return;
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
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
    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
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

    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
  };

  // Remove field
  const removeField = (sectionId: string, fieldId: string) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.fields = section.fields.filter((f) => f.id !== fieldId);
    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
  };

  // Reorder fields in section
  const reorderFields = (sectionId: string, fields: Field[]) => {
    if (!template) return;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    section.fields = fields;
    // Trigger re-render by creating a new instance
    const updated = new Template(
      template.id,
      template.name,
      template.description,
      template.version,
      template.isDefault,
      template.sections,
      template.createdAt,
      template.updatedAt,
      template.author
    );
    setTemplate(updated);
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

  // Create new version of template
  const handleCreateNewVersion = async () => {
    if (!template) return;

    try {
      const newVersion = await createNewVersion(template.id);
      toast.success(`New version ${newVersion.version} created successfully.`);
      navigate(`/templates/builder/${newVersion.id}`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Keyboard shortcuts handler
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    
    // Ctrl/Cmd + S: Save
    if (modifier && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }
    
    // Ctrl/Cmd + P: Toggle Preview
    if (modifier && e.key === 'p') {
      e.preventDefault();
      setShowPreviewModal(true);
      return;
    }
    
    // Ctrl/Cmd + Shift + F: Add Field
    if (modifier && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      // Add new field to first section
      if (template && template.sections.length > 0) {
        addField(template.sections[0].id);
      }
      return;
    }
    
    // Ctrl/Cmd + Shift + S: Add Section
    if (modifier && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      addSection();
      return;
    }
    
    // Escape: Close preview modal
    if (e.key === 'Escape' && showPreviewModal) {
      e.preventDefault();
      setShowPreviewModal(false);
      return;
    }
  }, [handleSave, showPreviewModal, template, addField, addSection]);

  // Register keyboard shortcuts listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

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
          <Button variant="outline" onClick={() => setShowPreviewModal(true)}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Full Preview
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
          {!isNew && !canEditTemplate ? (
            <Button onClick={handleCreateNewVersion}>
              <GitBranch className="w-4 h-4 mr-2" />
              Create New Version
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Alert for new templates with recommended fields */}
      {isNew && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Plus className="h-4 w-4" />
          <AlertTitle>Recommended Fields Included</AlertTitle>
          <AlertDescription>
            We've included common fields that are automatically recognized by the system:
            <strong> title</strong>, <strong>description</strong>, <strong>type</strong>, <strong>priority</strong>, <strong>blockers</strong>, <strong>status</strong>, <strong>assignee</strong>, <strong>due_date</strong>, and <strong>estimated_hours</strong>.
            You can customize, remove, or add new fields as needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert for locked templates */}
      {!isNew && !canEditTemplate && !checkingEditPermission && (
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertTitle>Template Locked for Editing</AlertTitle>
          <AlertDescription>
            This template has existing records and cannot be edited directly.
            To make changes, create a new version of the template.
          </AlertDescription>
        </Alert>
      )}

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
                  disabled={!canEditTemplate && !isNew}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={template.description}
                  onChange={(e) => updateDescription(e.target.value)}
                  placeholder="Describe the purpose of this template..."
                  disabled={!canEditTemplate && !isNew}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Version</label>
                <Input value={template.version} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Sections Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sections and Fields</CardTitle>
                <Button 
                  size="sm" 
                  onClick={addSection}
                  disabled={!canEditTemplate && !isNew}
                >
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

      {/* Full-screen Preview Modal */}
      <TemplatePreviewModal 
        template={template} 
        open={showPreviewModal} 
        onOpenChange={setShowPreviewModal} 
      />
    </div>
  );
}

