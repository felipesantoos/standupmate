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
  constructor(private readonly repository: ITicketRepository) {}

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
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Filter for completed yesterday
    const yesterdayFilter = new TicketFilter(
      TicketStatus.COMPLETED,
      undefined, // Any template
      undefined, // Any tags
      yesterday, // From yesterday
      now // Until now
    );

    // Filter for in progress today
    const todayFilter = new TicketFilter(
      TicketStatus.IN_PROGRESS,
      undefined,
      undefined,
      today, // From today
      now
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

