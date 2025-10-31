/**
 * Ticket Service Implementation
 * 
 * Orchestrates ticket business logic.
 * Following:
 * - Single Responsibility (only business logic)
 * - Dependency Inversion (depends on interfaces)
 * - Open/Closed (extend via new methods)
 */

import { Ticket } from '@core/domain/Ticket';
import { ITicketService } from '@core/interfaces/primary/ITicketService';
import { ITicketRepository } from '@core/interfaces/secondary/ITicketRepository';
import { ITemplateService } from '@core/interfaces/primary/ITemplateService';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import {
  TicketNotFoundException,
  InvalidOperationException,
} from '@core/exceptions/DomainExceptions';

export class TicketService implements ITicketService {
  /**
   * Constructor injection for testability.
   * Depends on INTERFACE, not concrete implementation (DIP).
   */
  constructor(
    private readonly repository: ITicketRepository,
    private readonly templateService: ITemplateService
  ) {}

  async listTickets(filter?: TicketFilter): Promise<Ticket[]> {
    // Simple delegation - repository handles all filter logic
    return await this.repository.findAll(filter);
  }

  async getTicket(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);

    if (!ticket) {
      throw new TicketNotFoundException(id);
    }

    return ticket;
  }

  async createTicket(ticket: Ticket): Promise<Ticket> {
    // Business validation
    ticket.validate();

    // Save
    return await this.repository.save(ticket);
  }

  async updateTicket(id: string, ticket: Ticket): Promise<Ticket> {
    // Check if exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TicketNotFoundException(id);
    }

    // Business validation
    ticket.validate();

    // Ensure ID is set
    ticket.id = id;
    ticket.updatedAt = new Date();

    return await this.repository.save(ticket);
  }

  async deleteTicket(id: string): Promise<boolean> {
    // Check if exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TicketNotFoundException(id);
    }

    return await this.repository.delete(id);
  }

  async markAsCompleted(id: string): Promise<Ticket> {
    // Get ticket
    const ticket = await this.getTicket(id);

    // Get template to validate required fields
    const template = await this.templateService.getTemplate(ticket.templateId);

    // Validate required fields before marking as completed
    const validation = ticket.validateRequiredFields(template);
    if (!validation.isValid) {
      const missingFieldNames = validation.missingFields.map(f => f.label).join(', ');
      throw new InvalidOperationException(
        'mark ticket as completed',
        `The following required fields are missing: ${missingFieldNames}`
      );
    }

    // Business operation (domain logic)
    ticket.markAsCompleted();

    // Save
    return await this.repository.save(ticket);
  }

  async markAsInProgress(id: string): Promise<Ticket> {
    // Get ticket
    const ticket = await this.getTicket(id);

    // Business operation (domain logic)
    ticket.markAsInProgress();

    // Save
    return await this.repository.save(ticket);
  }

  async archiveTicket(id: string): Promise<Ticket> {
    // Get ticket
    const ticket = await this.getTicket(id);

    // Business operation (domain logic)
    if (!ticket.canBeArchived()) {
      throw new InvalidOperationException(
        'archive ticket',
        'Only completed tickets can be archived'
      );
    }

    ticket.archive();

    // Save
    return await this.repository.save(ticket);
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    // Get ticket
    const ticket = await this.getTicket(id);

    // If status is COMPLETED, validate required fields
    if (status === TicketStatus.COMPLETED) {
      const template = await this.templateService.getTemplate(ticket.templateId);
      const validation = ticket.validateRequiredFields(template);
      
      if (!validation.isValid) {
        const missingFieldNames = validation.missingFields.map(f => f.label).join(', ');
        throw new InvalidOperationException(
          'mark ticket as completed',
          `The following required fields are missing: ${missingFieldNames}`
        );
      }
    }

    // Update status directly
    ticket.status = status;
    
    // If marked as completed, set completedAt
    if (status === TicketStatus.COMPLETED && !ticket.completedAt) {
      ticket.completedAt = new Date();
    }
    
    // Update timestamp
    ticket.updatedAt = new Date();

    // Save
    return await this.repository.save(ticket);
  }

  async bulkUpdateTicketStatus(
    ids: string[],
    status: TicketStatus
  ): Promise<{
    successful: Ticket[];
    failed: Array<{ id: string; ticket: Ticket; error: string }>;
  }> {
    const successful: Ticket[] = [];
    const failed: Array<{ id: string; ticket: Ticket; error: string }> = [];

    // Process each ticket individually
    for (const id of ids) {
      try {
        const updatedTicket = await this.updateTicketStatus(id, status);
        successful.push(updatedTicket);
      } catch (error) {
        // Capture error and continue processing other tickets
        try {
          const ticket = await this.getTicket(id);
          failed.push({
            id,
            ticket,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } catch (fetchError) {
          // If we can't even fetch the ticket, create a minimal error entry
          const dummyTicket = new Ticket(
            id,
            '',
            '',
            TicketStatus.DRAFT,
            {},
            { dev: '' },
            [],
            new Date(),
            new Date()
          );
          failed.push({
            id,
            ticket: dummyTicket,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return { successful, failed };
  }

  async countTickets(filter?: TicketFilter): Promise<number> {
    // Simple delegation
    return await this.repository.count(filter);
  }

  async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
    return await this.repository.findByStatus(status);
  }

  async getDailyStandupTickets(): Promise<{
    yesterday: Ticket[];
    today: Ticket[];
  }> {
    const now = new Date();
    
    // Get tickets completed in the last 7 days
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Filter for completed in the last week
    const yesterdayFilter = new TicketFilter(
      TicketStatus.COMPLETED,
      undefined, // Any template
      undefined, // Any tags
      weekAgo, // From 7 days ago
      now // Until now
    );

    // Filter for in progress (regardless of when they were created)
    const todayFilter = new TicketFilter(
      TicketStatus.IN_PROGRESS,
      undefined,
      undefined,
      undefined, // No date filter - get all in progress tickets
      undefined
    );

    const [yesterdayTickets, todayTickets] = await Promise.all([
      this.repository.findAll(yesterdayFilter),
      this.repository.findAll(todayFilter),
    ]);

    return {
      yesterday: yesterdayTickets,
      today: todayTickets,
    };
  }
}

