/**
 * Ticket Service Interface (Primary Port - Driver)
 * 
 * Defines business operations contract.
 * Following Interface Segregation Principle (ISP).
 * 
 * This is the use case interface - what the application can do with tickets.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';

export interface ITicketService {
  /**
   * List tickets with optional filtering
   * 
   * Service passes filter directly to repository.
   * No conditional logic here - repository handles all filtering.
   * 
   * @param filter - Optional filter object
   * @returns List of tickets matching filter criteria
   */
  listTickets(filter?: TicketFilter): Promise<Ticket[]>;

  /**
   * Get ticket by ID
   * 
   * @param id - Ticket ID
   * @returns Ticket if found, null otherwise
   * @throws TicketNotFoundException if ticket not found
   */
  getTicket(id: string): Promise<Ticket>;

  /**
   * Create new ticket
   * 
   * Enforces business validation before saving.
   * 
   * @param ticket - Ticket to create
   * @returns Created ticket
   * @throws ValidationException if validation fails
   */
  createTicket(ticket: Ticket): Promise<Ticket>;

  /**
   * Update existing ticket
   * 
   * @param id - Ticket ID
   * @param ticket - Updated ticket data
   * @returns Updated ticket
   * @throws TicketNotFoundException if ticket not found
   * @throws ValidationException if validation fails
   */
  updateTicket(id: string, ticket: Ticket): Promise<Ticket>;

  /**
   * Delete ticket
   * 
   * @param id - Ticket ID
   * @returns true if deleted
   * @throws TicketNotFoundException if ticket not found
   */
  deleteTicket(id: string): Promise<boolean>;

  /**
   * Mark ticket as completed
   * 
   * Business operation with validation.
   * 
   * @param id - Ticket ID
   * @returns Updated ticket
   * @throws TicketNotFoundException if ticket not found
   * @throws InvalidOperationException if already completed
   */
  markAsCompleted(id: string): Promise<Ticket>;

  /**
   * Mark ticket as in progress
   * 
   * @param id - Ticket ID
   * @returns Updated ticket
   */
  markAsInProgress(id: string): Promise<Ticket>;

  /**
   * Archive ticket
   * 
   * Only completed tickets can be archived.
   * 
   * @param id - Ticket ID
   * @returns Updated ticket
   * @throws InvalidOperationException if not completed
   */
  archiveTicket(id: string): Promise<Ticket>;

  /**
   * Update ticket status
   * 
   * Generic method to update ticket status to any value.
   * 
   * @param id - Ticket ID
   * @param status - New status
   * @returns Updated ticket
   * @throws TicketNotFoundException if ticket not found
   */
  updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket>;

  /**
   * Bulk update ticket status
   * 
   * Updates multiple tickets to a new status.
   * Processes each ticket individually and captures failures.
   * 
   * @param ids - Array of ticket IDs
   * @param status - New status
   * @returns Object with successful and failed updates
   */
  bulkUpdateTicketStatus(ids: string[], status: TicketStatus): Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }>;

  /**
   * Count tickets with optional filtering
   * 
   * Essential for pagination metadata.
   * 
   * @param filter - Optional filter object
   * @returns Total count of tickets matching filter
   */
  countTickets(filter?: TicketFilter): Promise<number>;

  /**
   * Get tickets by status
   * 
   * @param status - Ticket status
   * @returns List of tickets with given status
   */
  getTicketsByStatus(status: TicketStatus): Promise<Ticket[]>;

  /**
   * Get tickets for daily standup
   * 
   * Returns:
   * - Completed yesterday
   * - In progress today
   * 
   * @returns Object with yesterday and today tickets
   */
  getDailyStandupTickets(): Promise<{
    yesterday: Ticket[];
    today: Ticket[];
  }>;
}

