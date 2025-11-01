/**
 * Template API Repository
 * 
 * HTTP implementation of ITemplateRepository interface.
 * 
 * NOTE: This is a SCAFFOLD for future backend migration.
 * Currently, the app uses SQLiteTemplateRepository.
 */

import { ITemplateRepository } from '@core/interfaces/secondary/ITemplateRepository';
import { Template } from '@core/domain/Template';
import { apiClient } from '../client';
import { TemplateAPIMapper } from '../mappers/template.mapper';
import { TemplateResponse } from '../dtos/response/template.response';

/**
 * Template API Repository
 * 
 * Implements ITemplateRepository using HTTP API
 */
export class TemplateAPIRepository implements ITemplateRepository {
  private basePath = '/api/templates';

  async findAll(): Promise<Template[]> {
    const response = await apiClient.get<TemplateResponse[]>(this.basePath);
    return TemplateAPIMapper.toDomainList(response.data);
  }

  async findById(id: string): Promise<Template | null> {
    try {
      const response = await apiClient.get<TemplateResponse>(`${this.basePath}/${id}`);
      return TemplateAPIMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findDefault(): Promise<Template | null> {
    try {
      const response = await apiClient.get<TemplateResponse>(`${this.basePath}/default`);
      return TemplateAPIMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async save(template: Template): Promise<Template> {
    const hasId = template.id && template.id.trim() !== '';
    
    if (!hasId) {
      // CREATE
      const payload = TemplateAPIMapper.toCreatePayload(template);
      const response = await apiClient.post<TemplateResponse>(this.basePath, payload);
      return TemplateAPIMapper.toDomain(response.data);
    } else {
      // UPDATE
      const payload = TemplateAPIMapper.toUpdatePayload(template);
      const response = await apiClient.patch<TemplateResponse>(`${this.basePath}/${template.id}`, payload);
      return TemplateAPIMapper.toDomain(response.data);
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

  async setAsDefault(id: string): Promise<Template> {
    const response = await apiClient.post<TemplateResponse>(`${this.basePath}/${id}/set-default`);
    return TemplateAPIMapper.toDomain(response.data);
  }

  async findByName(name: string): Promise<Template | null> {
    try {
      const response = await apiClient.get<TemplateResponse>(`${this.basePath}/by-name`, {
        params: { name },
      });
      return TemplateAPIMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
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

  async count(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(`${this.basePath}/count`);
    return response.data.count;
  }

  async findByNameAndVersion(name: string, version: string): Promise<Template | null> {
    try {
      const response = await apiClient.get<TemplateResponse>(`${this.basePath}/by-name-version`, {
        params: { name, version },
      });
      return TemplateAPIMapper.toDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findVersionsByName(name: string): Promise<Template[]> {
    const response = await apiClient.get<TemplateResponse[]>(`${this.basePath}/versions`, {
      params: { name },
    });
    return TemplateAPIMapper.toDomainList(response.data);
  }

  async hasAssociatedTickets(id: string): Promise<boolean> {
    const response = await apiClient.get<{ has_tickets: boolean }>(`${this.basePath}/${id}/has-tickets`);
    return response.data.has_tickets;
  }
}

