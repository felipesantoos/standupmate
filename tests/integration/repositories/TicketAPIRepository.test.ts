/**
 * TicketAPIRepository Integration Tests
 * 
 * Tests repository with mock API client and mappers.
 * Following 08e-frontend-testing.md pattern (Section 3.3).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketAPIRepository } from '@infra/api/repositories/TicketAPIRepository';
import { apiClient } from '@infra/api/client';
import { TicketStatus } from '@core/domain/types';

// Mock axios client
vi.mock('@infra/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TicketAPIRepository', () => {
  let repository: TicketAPIRepository;

  beforeEach(() => {
    repository = new TicketAPIRepository();
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should fetch all tickets and map to domain', async () => {
      const apiResponse = {
        data: {
          items: [
            {
              id: '1',
              template_id: 'template-1', // snake_case
              template_version: '1.0.0',
              status: 'draft',
              data: { title: 'Test Ticket' },
              metadata: { dev: 'Felipe' },
              tags: ['backend'],
              created_at: '2024-01-01T00:00:00Z', // ISO string
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          total: 1,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(apiResponse);

      const result = await repository.findAll();

      // Assert: API was called
      expect(apiClient.get).toHaveBeenCalledWith('/api/tickets', expect.any(Object));

      // Assert: Mapper converted snake_case → camelCase
      expect(result).toHaveLength(1);
      expect(result[0].templateId).toBe('template-1'); // camelCase
      expect(result[0].templateVersion).toBe('1.0.0');
      expect(result[0].status).toBe(TicketStatus.DRAFT);
      
      // Assert: Dates converted to Date objects
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should pass filters as query params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { items: [], total: 0 } });

      const filter = {
        status: TicketStatus.COMPLETED,
        tags: ['backend', 'urgent'],
      };

      await repository.findAll(filter as any);

      // Assert: query params include filters
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/tickets',
        expect.objectContaining({
          params: expect.objectContaining({
            status: 'completed',
          }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create ticket and map Domain → DTO → Domain', async () => {
      const apiResponse = {
        data: {
          id: '1',
          template_id: 'template-1',
          template_version: '1.0.0',
          status: 'draft',
          data: { title: 'New Ticket' },
          metadata: { dev: 'Felipe Santos' },
          tags: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(apiResponse);

      const ticket = {
        id: '',
        templateId: 'template-1',
        templateVersion: '1.0.0',
        status: TicketStatus.DRAFT,
        data: { title: 'New Ticket' },
        metadata: { dev: 'Felipe Santos' },
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = await repository.save(ticket);

      // Assert: Payload was sent in snake_case
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/tickets',
        expect.objectContaining({
          template_id: 'template-1', // snake_case
          data: { title: 'New Ticket' },
        })
      );

      // Assert: Response mapped to camelCase
      expect(result.templateId).toBe('template-1');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 not found errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 404 },
        isAxiosError: true,
      });

      await expect(repository.findById('non-existent')).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: { status: 500, data: { message: 'Internal server error' } },
        isAxiosError: true,
      });

      await expect(repository.findAll()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(repository.findAll()).rejects.toThrow('Network error');
    });
  });
});

