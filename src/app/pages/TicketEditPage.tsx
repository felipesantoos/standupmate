/**
 * Ticket Edit Page
 * 
 * Create or edit a ticket with dynamic form fields.
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTickets } from '@app/hooks/useTickets';
import { useTemplates } from '@app/hooks/useTemplates';
import { useAutoSave } from '@app/hooks/useAutoSave';
import { Ticket } from '@core/domain/Ticket';
import { Template } from '@core/domain/Template';
import { TicketStatus } from '@core/domain/types';
import { DynamicField } from '@app/components/form/DynamicField';
import { TagManager } from '@app/components/ticket/TagManager';
import { Button } from '@app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Spinner } from '@app/components/ui/spinner';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';

function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
import { Save, ArrowLeft, Check, Play, FileDown, Undo, Redo, History, PlayCircle, CheckCircle, Download } from 'lucide-react';
import { TicketHistoryTimeline } from '@app/components/ticket/TicketHistoryTimeline';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useKeyboardShortcuts, SHORTCUTS } from '@app/hooks/useKeyboardShortcuts';
import { useExport } from '@app/hooks/useExport';
import { useUndoRedo } from '@app/hooks/useUndoRedo';
import { TicketChange, ChangeType } from '@core/domain/TicketHistory';

export function TicketEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/tickets/new';
  const { exportTicketToMarkdown, downloadAsFile } = useExport();

  const { tickets, loading: ticketsLoading, createTicket, updateTicket } = useTickets();
  const { templates, defaultTemplate, loading: templatesLoading } = useTemplates();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [ticketHistory, setTicketHistory] = useState<TicketChange[]>([]);

  // Undo/Redo for ticket data
  const {
    state: ticketData,
    setState: setTicketData,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetUndoRedo,
  } = useUndoRedo<Record<string, any>>({});

  // Load ticket and template
  useEffect(() => {
    if (ticketsLoading || templatesLoading) return;

    if (isNew) {
      // Set default template ID on first load
      if (defaultTemplate && !selectedTemplateId) {
        setSelectedTemplateId(defaultTemplate.id);
      }
    } else {
      // Load existing ticket
      const existingTicket = tickets.find((t) => t.id === id);
      if (existingTicket) {
        setTicket(existingTicket);
        const ticketTemplate = templates.find((t) => t.id === existingTicket.templateId);
        setTemplate(ticketTemplate || null);
        resetUndoRedo(existingTicket.data);
        
        // Load history from localStorage
        const savedHistory = localStorage.getItem(`ticket-history-${id}`);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setTicketHistory(parsed.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          })));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, tickets, templates, defaultTemplate, ticketsLoading, templatesLoading]);

  // Create ticket when template is selected (for new tickets)
  useEffect(() => {
    if (isNew && selectedTemplateId && !ticket) {
      const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
      if (selectedTemplate) {
        const newTicket = new Ticket(
          uuidv4(),
          selectedTemplate.id,
          selectedTemplate.version,
          TicketStatus.DRAFT,
          {},
          { dev: 'User' },
          [],
          new Date(),
          new Date()
        );
        setTicket(newTicket);
        setTemplate(selectedTemplate);
        resetUndoRedo({});
        
        // Initial history entry
        const initialChange: TicketChange = {
          id: uuidv4(),
          ticketId: newTicket.id,
          changeType: ChangeType.CREATED,
          timestamp: new Date(),
          description: 'Ticket created',
        };
        setTicketHistory([initialChange]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, selectedTemplateId, templates]);

  // Handle template change (for new tickets only)
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setTicket(null); // Reset ticket to recreate with new template
  };

  // Auto-save (only for existing tickets)
  const { isSaving, lastSaved } = useAutoSave({
    data: ticket,
    onSave: async (t) => {
      if (!isNew && t) {
        await updateTicket(t.id, t);
      }
    },
    delay: 2000,
    enabled: !isNew && !!ticket,
  });

  // Sync undo/redo state with ticket when undo/redo is used
  useEffect(() => {
    if (ticket && Object.keys(ticketData).length > 0 && JSON.stringify(ticket.data) !== JSON.stringify(ticketData)) {
      setTicket({
        ...ticket,
        data: ticketData,
        updatedAt: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketData]);

  // Update field value
  const updateField = (fieldId: string, value: any) => {
    if (!ticket) return;

    const oldValue = ticket.data[fieldId];
    const newData = { ...ticket.data, [fieldId]: value };

    // Update ticket
    const updatedTicket = new Ticket(
      ticket.id,
      ticket.templateId,
      ticket.templateVersion,
      ticket.status,
      newData,
      ticket.metadata,
      ticket.tags,
      ticket.createdAt,
      new Date(),
      ticket.completedAt
    );

    setTicket(updatedTicket);
    
    // Update undo/redo state
    setTicketData(newData);

    // Track change in history (only if value actually changed)
    if (!isNew && oldValue !== value) {
      const change: TicketChange = {
        id: uuidv4(),
        ticketId: ticket.id,
        changeType: ChangeType.UPDATED,
        field: fieldId,
        oldValue,
        newValue: value,
        timestamp: new Date(),
        description: `Field updated`,
      };
      const newHistory = [...ticketHistory, change];
      setTicketHistory(newHistory);
      localStorage.setItem(`ticket-history-${ticket.id}`, JSON.stringify(newHistory));
    }
  };

  // Update tags
  const updateTags = (newTags: string[]) => {
    if (!ticket) return;

    const updatedTicket = new Ticket(
      ticket.id,
      ticket.templateId,
      ticket.templateVersion,
      ticket.status,
      ticket.data,
      ticket.metadata,
      newTags,
      ticket.createdAt,
      new Date(),
      ticket.completedAt
    );

    setTicket(updatedTicket);
  };

  // Validate ticket
  const validate = (): boolean => {
    if (!ticket || !template) return false;

    const newErrors: Record<string, string> = {};

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = ticket.data[field.id];

        if (field.required && !value) {
          newErrors[field.id] = `${field.label} is required`;
        }

        if (field.validation) {
          if (field.validation.minLength && value && value.length < field.validation.minLength) {
            newErrors[field.id] = `Minimum ${field.validation.minLength} characters`;
          }
          if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
            newErrors[field.id] = `Maximum ${field.validation.maxLength} characters`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save ticket
  const handleSave = async () => {
    if (!validate()) {
      toast.warning('Please fix errors before saving.');
      return;
    }

    try {
      if (isNew && ticket) {
        await createTicket(ticket);
        toast.success('Ticket was created successfully.');
        navigate('/tickets');
      } else if (ticket) {
        await updateTicket(ticket.id, ticket);
        toast.success('Ticket updated successfully.');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Mark as in progress
  const handleMarkInProgress = async () => {
    if (!ticket) return;

    const updatedTicket = new Ticket(
      ticket.id,
      ticket.templateId,
      ticket.templateVersion,
      TicketStatus.IN_PROGRESS,
      ticket.data,
      ticket.metadata,
      ticket.tags,
      ticket.createdAt,
      new Date(),
      ticket.completedAt
    );

    setTicket(updatedTicket);
    
    if (!isNew) {
      await updateTicket(ticket.id, updatedTicket);
      
      // Add to history
      const change: TicketChange = {
        id: uuidv4(),
        ticketId: ticket.id,
        changeType: ChangeType.STATUS_CHANGED,
        oldValue: ticket.status,
        newValue: TicketStatus.IN_PROGRESS,
        timestamp: new Date(),
        description: 'Status changed to "In Progress"',
      };
      const newHistory = [...ticketHistory, change];
      setTicketHistory(newHistory);
      localStorage.setItem(`ticket-history-${ticket.id}`, JSON.stringify(newHistory));
    }
  };

  // Mark as completed
  const handleMarkCompleted = async () => {
    if (!ticket || !validate()) return;

    try {
      ticket.markAsCompleted();
      setTicket({ ...ticket });
      
      if (!isNew) {
        await updateTicket(ticket.id, ticket);
        
        // Add to history
        const change: TicketChange = {
          id: uuidv4(),
          ticketId: ticket.id,
          changeType: ChangeType.COMPLETED,
          oldValue: ticket.status,
          newValue: TicketStatus.COMPLETED,
          timestamp: new Date(),
          description: 'Ticket marked as complete',
        };
        const newHistory = [...ticketHistory, change];
        setTicketHistory(newHistory);
        localStorage.setItem(`ticket-history-${ticket.id}`, JSON.stringify(newHistory));
        
        toast.success('Ticket marked as complete.');
      }
    } catch (error) {
      toast.error('Erro', (error as Error).message);
    }
  };

  // Export to Markdown
  const handleExport = async () => {
    if (!ticket || !template) return;

    try {
      const markdown = await exportTicketToMarkdown(ticket, template);
      const filename = `ticket-${ticket.data['title'] || 'untitled'}.md`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      downloadAsFile(markdown, filename);
      toast.success('Ticket exported as Markdown.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Keyboard shortcuts (after functions are defined)
  useKeyboardShortcuts([
    { ...SHORTCUTS.SAVE, action: handleSave },
    { ...SHORTCUTS.EXPORT, action: handleExport },
    { ...SHORTCUTS.ESCAPE, action: () => navigate('/tickets') },
  ], !!ticket);

  // Show loading while data is being fetched
  if (ticketsLoading || templatesLoading) {
    return <PageSpinner />;
  }

  // For new tickets, wait for default template
  if (isNew && !defaultTemplate) {
    return <PageSpinner />;
  }

  // For existing tickets, check if ticket was found
  if (!isNew && !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button className="mt-4" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  // Final check
  if (!ticket || !template) {
    return <PageSpinner />;
  }

  return (
    <div className="w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? 'New Ticket' : 'Edit Ticket'}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground mt-1">
                {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Undo/Redo */}
          <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </Button>

          {!isNew && (
            <>
              <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export MD
              </Button>
            </>
          )}

          {ticket.status === TicketStatus.DRAFT && (
            <Button variant="outline" onClick={handleMarkInProgress}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}
          
          {ticket.status === TicketStatus.IN_PROGRESS && (
            <Button variant="outline" onClick={handleMarkCompleted}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}

          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Template Selector (for new tickets) */}
      {isNew && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Template</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            {template && (
              <p className="text-sm text-muted-foreground mt-2">
                {template.description || 'No description'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <div className="space-y-6">
        {template.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={ticket.data[field.id]}
                  onChange={(value) => updateField(field.id, value)}
                  error={errors[field.id]}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tags Section */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <TagManager 
            tags={ticket.tags} 
            onChange={updateTags}
            suggestions={['feature', 'bug', 'refactor', 'documentation', 'test', 'ui', 'backend', 'frontend']}
          />
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Status:</strong> {ticket.status}
        </p>
      </div>

      {/* History Timeline */}
      {showHistory && !isNew && (
        <div className="mt-6">
          <TicketHistoryTimeline changes={ticketHistory} />
        </div>
      )}
    </div>
  );
}
