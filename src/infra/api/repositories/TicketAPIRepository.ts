/**
 * Ticket API Repository
 * 
 * HTTP implementation of ITicketRepository interface.
 * Following Colabora pattern for API repositories.
 * 
 * NOTE: This is a SCAFFOLD for future backend migration.
 * Currently, the app uses SQLiteTicketRepository.
 */

import { ITicketRepository } from '@core/interfaces/secondary/ITicketRepository';
import { Ticket } from '@core/domain/Ticket';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { apiClient } from '../client';
import { TicketAPIMapper } from '../mappers/ticket.mapper';
import { TicketResponse } from '../dtos/response/ticket.response';

/**
 * Ticket API Repository
 * 
 * Implements ITicketRepository using HTTP API
 */
export class TicketAPIRepository implements ITicketRepository {
  private basePath = '/api/tickets';

  async findAll(filter?: TicketFilter): Promise<Ticket[]> {
    // Build query params from filter
    const params: Record<string, any> = {};
    
    if (filter?.hasStatusFilter()) {
      params.status = filter.status;
    }
    if (filter?.hasTemplateFilter()) {
      params.template_id = filter.templateId;
    }
    if (filter?.hasTagsFilter()) {
      params.tags = filter.tags?.join(',');
    }
    if (filter?.hasDateFilter()) {
      if (filter.dateFrom) params.date_from = filter.dateFrom.toISOString();
      if (filter.dateTo) params.date_to = filter.dateTo.toISOString();
    }
    
    const response = await apiClient.get<TicketResponse[]>(this.basePath, { params });
    return TicketAPIMapper.toDomainList(response.data);
  }

  async findById(id: string): Promise<Ticket | null> {
    try {
      const response = await apiClient.get<TicketResponse>(`${this.basePath}/${id}`);
      return TicketAPIMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async save(ticket: Ticket): Promise<Ticket> {
    // Check if ticket has ID (update) or not (create)
    const hasId = ticket.id && ticket.id.trim() !== '';
    
    if (!hasId) {
      // CREATE
      const payload = TicketAPIMapper.toCreatePayload(ticket);
      const response = await apiClient.post<TicketResponse>(this.basePath, payload);
      return TicketAPIMapper.toDomain(response.data);
    } else {
      // UPDATE
      const payload = TicketAPIMapper.toUpdatePayload(ticket);
      const response = await apiClient.patch<TicketResponse>(`${this.basePath}/${ticket.id}`, payload);
      return TicketAPIMapper.toDomain(response.data);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      await apiClient.head(`${this.basePath}/${id}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async count(filter?: TicketFilter): Promise<number> {
    // Build query params
    const params: Record<string, any> = { count_only: true };
    
    if (filter?.hasStatusFilter()) {
      params.status = filter.status;
    }
    
    const response = await apiClient.get<{ count: number }>(`${this.basePath}/count`, { params });
    return response.data.count;
  }

  async findByStatus(status: import('@core/domain/types').TicketStatus): Promise<Ticket[]> {
    const response = await apiClient.get<TicketResponse[]>(this.basePath, {
      params: { status },
    });
    return TicketAPIMapper.toDomainList(response.data);
  }

  async findByTemplateId(templateId: string): Promise<Ticket[]> {
    const response = await apiClient.get<TicketResponse[]>(this.basePath, {
      params: { template_id: templateId },
    });
    return TicketAPIMapper.toDomainList(response.data);
  }

  async findByTag(tag: string): Promise<Ticket[]> {
    const response = await apiClient.get<TicketResponse[]>(this.basePath, {
      params: { tag },
    });
    return TicketAPIMapper.toDomainList(response.data);
  }
}

