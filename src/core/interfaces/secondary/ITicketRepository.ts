/**
 * Ticket Repository Interface (Secondary Port - Driven)
 * 
 * Defines data persistence contract.
 * Following Dependency Inversion Principle (DIP).
 * 
 * Domain depends on this interface, not on concrete implementation.
 * Can swap implementations (SQLite, JSON, Cloud, In-Memory for tests).
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';

export interface ITicketRepository {
  /**
   * Find all tickets with optional filtering, pagination, and sorting.
   * 
   * Filter Pattern: Accepts filter object with:
   * - search: General search term (from BaseFilter)
   * - pagination: page/pageSize (from BaseFilter)
   * - sorting: sortBy/sortOrder (from BaseFilter)
   * - specific filters: status, templateId, tags, dateRange (from TicketFilter)
   * 
   * @param filter - Optional filter object
   * @returns List of tickets matching filter criteria (paginated and sorted)
   */
  findAll(filter?: TicketFilter): Promise<Ticket[]>;

  /**
   * Find ticket by ID
   * 
   * @param id - Ticket ID
   * @returns Ticket if found, null otherwise
   */
  findById(id: string): Promise<Ticket | null>;

  /**
   * Find tickets by status
   * 
   * @param status - Ticket status
   * @returns List of tickets with given status
   */
  findByStatus(status: TicketStatus): Promise<Ticket[]>;

  /**
   * Find tickets by template ID
   * 
   * @param templateId - Template ID
   * @returns List of tickets using given template
   */
  findByTemplateId(templateId: string): Promise<Ticket[]>;

  /**
   * Find tickets by tag
   * 
   * @param tag - Tag name
   * @returns List of tickets with given tag
   */
  findByTag(tag: string): Promise<Ticket[]>;

  /**
   * Save (create or update) ticket
   * 
   * @param ticket - Ticket to save
   * @returns Saved ticket
   */
  save(ticket: Ticket): Promise<Ticket>;

  /**
   * Delete ticket
   * 
   * @param id - Ticket ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count tickets with optional filtering
   * 
   * Essential for pagination metadata (total_pages, has_next, etc.)
   * Uses same filters as findAll but without pagination/sorting.
   * 
   * @param filter - Optional filter object (pagination/sorting ignored)
   * @returns Total number of tickets matching filter criteria
   */
  count(filter?: TicketFilter): Promise<number>;

  /**
   * Check if ticket exists
   * 
   * @param id - Ticket ID
   * @returns true if exists
   */
  exists(id: string): Promise<boolean>;
}

