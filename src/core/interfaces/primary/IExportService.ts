/**
 * Export Service Interface (Primary Port - Driver)
 * 
 * Defines export operations contract.
 * Following Interface Segregation Principle (ISP).
 */

import { Ticket } from '@core/domain/Ticket';
import { Template } from '@core/domain/Template';

export interface TicketBlocker {
  ticketId: string;
  ticketTitle: string;
  blocker: string;
}

export interface IExportService {
  /**
   * Export ticket to Markdown format
   * 
   * @param ticket - Ticket to export
   * @param template - Template structure (for formatting)
   * @returns Markdown string
   */
  exportTicketToMarkdown(ticket: Ticket, template: Template): string;

  /**
   * Export multiple tickets to Markdown (batch)
   * 
   * @param tickets - Tickets to export
   * @param templates - Templates (map by ID)
   * @returns Array of { ticketId, markdown, filename }
   */
  exportTicketsToMarkdown(
    tickets: Ticket[],
    templates: Map<string, Template>
  ): Promise<Array<{ ticketId: string; markdown: string; filename: string }>>;

  /**
   * Export ticket to JSON format
   * 
   * @param ticket - Ticket to export
   * @returns JSON string
   */
  exportTicketToJSON(ticket: Ticket): string;

  /**
   * Export template to JSON format
   * 
   * @param template - Template to export
   * @returns JSON string
   */
  exportTemplateToJSON(template: Template): string;

  /**
   * Generate daily standup report
   * 
   * @param yesterdayTickets - Tickets completed yesterday
   * @param todayTickets - Tickets in progress today
   * @param blockers - Identified blockers with structured data
   * @returns Markdown formatted daily standup
   */
  generateDailyStandup(
    yesterdayTickets: Ticket[],
    todayTickets: Ticket[],
    blockers: TicketBlocker[]
  ): string;

  /**
   * Export entire database as JSON
   * Includes database binary (base64), metadata, and localStorage data
   * 
   * @returns Promise with JSON string containing complete backup
   */
  exportDatabaseAsJSON(): Promise<string>;
}

