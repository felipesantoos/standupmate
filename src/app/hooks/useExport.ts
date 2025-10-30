/**
 * useExport Hook
 * 
 * Custom hook for export operations.
 */

import { useState } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { Template } from '@core/domain/Template';
import { createExportService } from '@/lib/serviceFactory';

interface UseExportResult {
  exportTicketToMarkdown: (ticket: Ticket, template: Template) => Promise<string>;
  exportTicketToJSON: (ticket: Ticket) => Promise<string>;
  exportTicketsToMarkdown: (
    tickets: Ticket[],
    templates: Map<string, Template>
  ) => Promise<Array<{ ticketId: string; markdown: string; filename: string }>>;
  generateDailyStandup: (
    yesterdayTickets: Ticket[],
    todayTickets: Ticket[],
    blockers: string[]
  ) => Promise<string>;
  exportDatabaseAsJSON: () => Promise<string>;
  downloadAsFile: (content: string, filename: string) => void;
  loading: boolean;
  error: Error | null;
}

export function useExport(): UseExportResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Export ticket to Markdown
   */
  const exportTicketToMarkdown = async (
    ticket: Ticket,
    template: Template
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const service = await createExportService();
      const markdown = service.exportTicketToMarkdown(ticket, template);

      return markdown;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export ticket to JSON
   */
  const exportTicketToJSON = async (ticket: Ticket): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const service = await createExportService();
      const json = service.exportTicketToJSON(ticket);

      return json;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export multiple tickets to Markdown
   */
  const exportTicketsToMarkdown = async (
    tickets: Ticket[],
    templates: Map<string, Template>
  ): Promise<Array<{ ticketId: string; markdown: string; filename: string }>> => {
    try {
      setLoading(true);
      setError(null);

      const service = await createExportService();
      const results = await service.exportTicketsToMarkdown(tickets, templates);

      return results;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate daily standup report
   */
  const generateDailyStandup = async (
    yesterdayTickets: Ticket[],
    todayTickets: Ticket[],
    blockers: string[]
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const service = await createExportService();
      const markdown = service.generateDailyStandup(yesterdayTickets, todayTickets, blockers);

      return markdown;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export entire database as JSON backup
   */
  const exportDatabaseAsJSON = async (): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const service = await createExportService();
      const json = await service.exportDatabaseAsJSON();

      return json;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download content as file
   * Helper function to trigger browser download
   */
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportTicketToMarkdown,
    exportTicketToJSON,
    exportTicketsToMarkdown,
    generateDailyStandup,
    exportDatabaseAsJSON,
    downloadAsFile,
    loading,
    error,
  };
}

