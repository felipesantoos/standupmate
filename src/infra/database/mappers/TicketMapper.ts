/**
 * Ticket Mapper
 * 
 * Converts between database models and domain models.
 * Following Mapper Pattern from guides.
 * 
 * Responsibilities:
 * - toDomain: Database Row → Domain Model
 * - fromDomain: Domain Model → Database Row
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';

/**
 * Database row structure
 */
export interface TicketRow {
  id: string;
  template_id: string;
  template_version: string;
  status: string;
  data_json: string;
  metadata_json: string;
  tags_json: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export class TicketMapper {
  /**
   * Convert database row to domain model
   * 
   * @param row - Database row
   * @returns Domain model
   */
  static toDomain(row: TicketRow): Ticket {
    return new Ticket(
      row.id,
      row.template_id,
      row.template_version,
      row.status as TicketStatus,
      JSON.parse(row.data_json),
      JSON.parse(row.metadata_json),
      JSON.parse(row.tags_json || '[]'),
      new Date(row.created_at),
      new Date(row.updated_at),
      row.completed_at ? new Date(row.completed_at) : undefined
    );
  }

  /**
   * Convert domain model to database row
   * 
   * @param ticket - Domain model
   * @returns Database row
   */
  static fromDomain(ticket: Ticket): TicketRow {
    return {
      id: ticket.id,
      template_id: ticket.templateId,
      template_version: ticket.templateVersion,
      status: ticket.status,
      data_json: JSON.stringify(ticket.data),
      metadata_json: JSON.stringify(ticket.metadata),
      tags_json: JSON.stringify(ticket.tags),
      created_at: ticket.createdAt.toISOString(),
      updated_at: ticket.updatedAt.toISOString(),
      completed_at: ticket.completedAt ? ticket.completedAt.toISOString() : null,
    };
  }

  /**
   * Convert multiple rows to domain models
   * 
   * @param rows - Database rows
   * @returns Domain models
   */
  static toDomainList(rows: TicketRow[]): Ticket[] {
    return rows.map(row => TicketMapper.toDomain(row));
  }
}

