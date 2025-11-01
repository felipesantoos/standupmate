/**
 * Ticket API Mapper
 * 
 * Transforms between API DTOs and Domain entities.
 * Following Colabora pattern for API mappers.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { TicketResponse } from '../dtos/response/ticket.response';
import { CreateTicketRequest, UpdateTicketRequest } from '../dtos/request/ticket.request';

/**
 * Ticket API Mapper
 * 
 * Bidirectional transformation: API DTO ↔ Domain Model
 */
export class TicketAPIMapper {
  /**
   * API Response → Domain Model
   * 
   * Transforms API response to domain entity
   */
  static toDomain(response: TicketResponse): Ticket {
    return new Ticket(
      response.id,
      response.template_id,
      response.template_version,
      response.status as TicketStatus,
      response.data,
      response.metadata,
      response.tags,
      new Date(response.created_at),
      new Date(response.updated_at),
      response.completed_at ? new Date(response.completed_at) : undefined
    );
  }

  /**
   * Domain Model → Create Request
   * 
   * Transforms domain entity to API create request
   */
  static toCreatePayload(ticket: Ticket): CreateTicketRequest {
    return {
      template_id: ticket.templateId,
      template_version: ticket.templateVersion,
      status: ticket.status,
      data: ticket.data,
      metadata: ticket.metadata,
      tags: ticket.tags,
    };
  }

  /**
   * Domain Model → Update Request
   * 
   * Transforms domain entity to API update request
   */
  static toUpdatePayload(ticket: Ticket): UpdateTicketRequest {
    return {
      status: ticket.status,
      data: ticket.data,
      metadata: ticket.metadata,
      tags: ticket.tags,
    };
  }

  /**
   * Array of API Response → Array of Domain Model
   * 
   * Convenience method for bulk transformations
   */
  static toDomainList(responses: TicketResponse[]): Ticket[] {
    return responses.map(response => TicketAPIMapper.toDomain(response));
  }
}

