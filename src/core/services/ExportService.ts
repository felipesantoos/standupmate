/**
 * Export Service Implementation
 * 
 * Handles exporting tickets and templates to different formats.
 * Following Single Responsibility Principle.
 */

import { Ticket } from '@core/domain/Ticket';
import { Template } from '@core/domain/Template';
import { IExportService } from '@core/interfaces/primary/IExportService';
import { FieldType } from '@core/domain/types';

export class ExportService implements IExportService {
  exportTicketToMarkdown(ticket: Ticket, template: Template): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${ticket.data['title'] || 'Untitled Ticket'}`);
    lines.push('');
    lines.push(`**📅 Date:** ${ticket.createdAt.toLocaleDateString()} | **👤 Dev:** ${ticket.metadata.dev} | **⏱️ Estimate:** ${ticket.metadata.estimate || 'Not set'}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Iterate through template sections
    template.sections.forEach(section => {
      // Section header
      lines.push(`## ${section.icon || ''} ${section.title}`.trim());
      lines.push('');

      // Fields
      section.fields.forEach(field => {
        const value = ticket.data[field.id];
        
        lines.push(`### ${field.label}`);
        
        if (value !== undefined && value !== null && value !== '') {
          // Format based on field type
          switch (field.type) {
            case FieldType.CHECKBOX:
              if (Array.isArray(value)) {
                value.forEach((item: string) => {
                  lines.push(`- ☑️ ${item}`);
                });
              } else {
                lines.push(`☑️ ${value ? 'Yes' : 'No'}`);
              }
              break;

            case FieldType.CHECKLIST:
              if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  const checked = item.completed ? '✅' : '⬜';
                  lines.push(`- [${item.completed ? 'x' : ' '}] ${checked} ${item.text}`);
                });
              }
              break;

            case FieldType.TEXTAREA:
            case FieldType.MARKDOWN:
              lines.push(value);
              break;

            case FieldType.SELECT:
            case FieldType.RADIO:
            case FieldType.TEXT:
            case FieldType.NUMBER:
            case FieldType.DATE:
            default:
              lines.push(value.toString());
              break;
          }
        } else {
          lines.push('_Not filled_');
        }
        
        lines.push('');
      });

      lines.push('---');
      lines.push('');
    });

    // Metadata footer
    lines.push('## 📊 Metadata');
    lines.push('');
    lines.push(`- **Status:** ${ticket.status}`);
    lines.push(`- **Created:** ${ticket.createdAt.toISOString()}`);
    lines.push(`- **Updated:** ${ticket.updatedAt.toISOString()}`);
    if (ticket.completedAt) {
      lines.push(`- **Completed:** ${ticket.completedAt.toISOString()}`);
    }
    if (ticket.tags.length > 0) {
      lines.push(`- **Tags:** ${ticket.tags.join(', ')}`);
    }
    lines.push('');

    return lines.join('\n');
  }

  async exportTicketsToMarkdown(
    tickets: Ticket[],
    templates: Map<string, Template>
  ): Promise<Array<{ ticketId: string; markdown: string; filename: string }>> {
    const results: Array<{ ticketId: string; markdown: string; filename: string }> = [];

    for (const ticket of tickets) {
      const template = templates.get(ticket.templateId);
      
      if (!template) {
        continue; // Skip tickets with missing templates
      }

      const markdown = this.exportTicketToMarkdown(ticket, template);
      const filename = this.generateFilename(ticket);

      results.push({
        ticketId: ticket.id,
        markdown,
        filename,
      });
    }

    return results;
  }

  exportTicketToJSON(ticket: Ticket): string {
    const data = {
      id: ticket.id,
      templateId: ticket.templateId,
      templateVersion: ticket.templateVersion,
      status: ticket.status,
      data: ticket.data,
      metadata: ticket.metadata,
      tags: ticket.tags,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      completedAt: ticket.completedAt?.toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  exportTemplateToJSON(template: Template): string {
    const data = {
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      isDefault: template.isDefault,
      sections: template.sections,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      author: template.author,
    };

    return JSON.stringify(data, null, 2);
  }

  generateDailyStandup(
    yesterdayTickets: Ticket[],
    todayTickets: Ticket[],
    blockers: string[]
  ): string {
    const lines: string[] = [];
    const today = new Date();

    lines.push(`# 📅 Daily Standup - ${today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Yesterday
    lines.push('## Yesterday (Completed)');
    lines.push('');
    if (yesterdayTickets.length > 0) {
      yesterdayTickets.forEach(ticket => {
        const title = ticket.data['title'] || 'Untitled';
        lines.push(`- ✅ **${ticket.id}**: ${title}`);
        if (ticket.metadata.actualTime) {
          lines.push(`  - Time spent: ${ticket.metadata.actualTime}`);
        }
      });
    } else {
      lines.push('_No tickets completed yesterday_');
    }
    lines.push('');

    // Today
    lines.push('## Today (In Progress)');
    lines.push('');
    if (todayTickets.length > 0) {
      todayTickets.forEach(ticket => {
        const title = ticket.data['title'] || 'Untitled';
        lines.push(`- 🟡 **${ticket.id}**: ${title}`);
        if (ticket.metadata.estimate) {
          lines.push(`  - Estimate: ${ticket.metadata.estimate}`);
        }
      });
    } else {
      lines.push('_No tickets in progress today_');
    }
    lines.push('');

    // Blockers
    lines.push('## Blockers');
    lines.push('');
    if (blockers.length > 0) {
      blockers.forEach(blocker => {
        lines.push(`- ⚠️ ${blocker}`);
      });
    } else {
      lines.push('_No blockers_');
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Private helper: Generate filename for ticket
   */
  private generateFilename(ticket: Ticket): string {
    const title = ticket.data['title'] || 'untitled';
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const date = ticket.createdAt.toISOString().split('T')[0];
    return `${date}-${sanitized}.md`;
  }
}

