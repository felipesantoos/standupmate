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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';

function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
import { Save, ArrowLeft, History, PlayCircle, CheckCircle, Download, FileEdit, Archive, Copy } from 'lucide-react';
import { TicketHistoryTimeline } from '@app/components/ticket/TicketHistoryTimeline';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useKeyboardShortcuts, SHORTCUTS } from '@app/hooks/useKeyboardShortcuts';
import { useExport } from '@app/hooks/useExport';
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
  const [ticketLoadAttempted, setTicketLoadAttempted] = useState(false);
  const [ticketHistory, setTicketHistory] = useState<TicketChange[]>([]);

  // Reset ticket load state when ID changes
  useEffect(() => {
    setTicketLoadAttempted(false);
    setTicket(null);
    setTemplate(null);
  }, [id]);

  // Load ticket and template
  useEffect(() => {
    if (ticketsLoading || templatesLoading) return;

    if (isNew) {
      // Set default template ID on first load
      if (defaultTemplate && !selectedTemplateId) {
        setSelectedTemplateId(defaultTemplate.id);
      }
      setTicketLoadAttempted(true);
    } else {
      // Load existing ticket
      const existingTicket = tickets.find((t) => t.id === id);
      if (existingTicket) {
        // Only update ticket if it's different (to avoid unnecessary re-renders)
        if (!ticket || ticket.id !== existingTicket.id || ticket.updatedAt.getTime() !== existingTicket.updatedAt.getTime()) {
          setTicket(existingTicket);
          const ticketTemplate = templates.find((t) => t.id === existingTicket.templateId);
          setTemplate(ticketTemplate || null);
          
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
        setTicketLoadAttempted(true);
      } else if (tickets.length > 0) {
        // Tickets loaded but ticket not found
        setTicketLoadAttempted(true);
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
  useAutoSave({
    data: ticket,
    onSave: async (t) => {
      if (!isNew && t) {
        await updateTicket(t.id, t);
        toast.success('Changes saved automatically', {
          duration: 2000,
        });
      }
    },
    delay: 2000,
    enabled: !isNew && !!ticket,
  });

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

  // Update status
  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;

    const oldStatus = ticket.status;
    const status = newStatus as TicketStatus;

    // Validate required fields only when trying to mark as completed
    if (status === TicketStatus.COMPLETED) {
      if (!validate()) {
        toast.error('Não é possível concluir o ticket. Por favor, preencha todos os campos obrigatórios.');
        return; // Prevent status change
      }
    }

    const updatedTicket = new Ticket(
      ticket.id,
      ticket.templateId,
      ticket.templateVersion,
      status,
      ticket.data,
      ticket.metadata,
      ticket.tags,
      ticket.createdAt,
      new Date(),
      status === TicketStatus.COMPLETED ? new Date() : ticket.completedAt
    );

    setTicket(updatedTicket);

    if (!isNew) {
      await updateTicket(ticket.id, updatedTicket);

      // Add to history
      const change: TicketChange = {
        id: uuidv4(),
        ticketId: ticket.id,
        changeType: ChangeType.STATUS_CHANGED,
        oldValue: oldStatus,
        newValue: status,
        timestamp: new Date(),
        description: `Status changed from "${oldStatus}" to "${status}"`,
      };
      const newHistory = [...ticketHistory, change];
      setTicketHistory(newHistory);
      localStorage.setItem(`ticket-history-${ticket.id}`, JSON.stringify(newHistory));
      
      toast.success(`Status updated to ${status}`);
    }
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
    // Allow saving even with validation errors
    // Validation is only enforced when marking as completed
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

  // Export to Markdown
  const handleExport = async () => {
    if (!ticket || !template) return;

    try {
      const markdown = await exportTicketToMarkdown(ticket, template);
      const filename = `ticket-${ticket.getTitle()}.md`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      downloadAsFile(markdown, filename);
      toast.success('Ticket exported as Markdown.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Copy Markdown to Clipboard
  const handleCopyMarkdown = async () => {
    if (!ticket || !template) return;

    try {
      const markdown = await exportTicketToMarkdown(ticket, template);
      await navigator.clipboard.writeText(markdown);
      toast.success('Markdown copied to clipboard.');
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

  // Ticket not found after loading
  if (!isNew && ticketLoadAttempted && !ticket && !ticketsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-semibold">Ticket not found</h2>
        <p className="text-muted-foreground">The ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? 'New Ticket' : 'Edit Ticket'}
            </h1>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isNew && (
            <>
              {/* Status Dropdown */}
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 w-[140px] cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TicketStatus.DRAFT} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-4 h-4" />
                      <span>Draft</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.IN_PROGRESS} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.COMPLETED} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={TicketStatus.ARCHIVED} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      <span>Archived</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyMarkdown}
                className="transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy MD
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                className="transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export MD
              </Button>
            </>
          )}

          <Button onClick={handleSave} size="sm" className="transition-colors">
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
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{t.name}</span>
                      <Badge variant="outline" className="text-xs">
                        v{t.version}
                      </Badge>
                      {t.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* History Timeline */}
      {showHistory && !isNew && (
        <div className="mt-6">
          <TicketHistoryTimeline changes={ticketHistory} />
        </div>
      )}
    </div>
  );
}
