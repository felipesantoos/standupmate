/**
 * TicketContext Integration Tests
 * 
 * Tests Context + Service integration with mock DI Container.
 * Following 08e-frontend-testing.md pattern (Section 3.4).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { TicketProvider, useTicketContext } from '@app/contexts/TicketContext';
import { diContainer } from '@app/dicontainer/dicontainer';
import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { ReactNode } from 'react';

// Mock DI Container
vi.mock('@app/dicontainer/dicontainer', () => ({
  diContainer: {
    ticketService: {
      listTickets: vi.fn(),
      getTicket: vi.fn(),
      createTicket: vi.fn(),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      markAsCompleted: vi.fn(),
      archiveTicket: vi.fn(),
      updateTicketStatus: vi.fn(),
      bulkUpdateStatus: vi.fn(),
      getDailyStandupTickets: vi.fn(),
      getTicketStats: vi.fn(),
      countTickets: vi.fn(), // Added missing method
    },
  },
}));

describe('TicketContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TicketProvider>{children}</TicketProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should fetch tickets on mount', async () => {
      const mockTickets = [
        new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Test 1' }, { dev: 'Felipe' }, [], new Date(), new Date()),
        new Ticket('2', 't1', '1.0.0', TicketStatus.IN_PROGRESS, { title: 'Test 2' }, { dev: 'Ana' }, [], new Date(), new Date()),
      ];

      vi.mocked(diContainer.ticketService.listTickets).mockResolvedValue(mockTickets);
      vi.mocked(diContainer.ticketService.countTickets).mockResolvedValue(2);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      // Initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.tickets).toEqual([]);

      // Wait for fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: service was called
      expect(diContainer.ticketService.listTickets).toHaveBeenCalled();

      // Assert: state updated
      expect(result.current.tickets).toHaveLength(2);
      expect(result.current.tickets[0].id).toBe('1');
      expect(result.current.totalCount).toBe(2);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch tickets');
      vi.mocked(diContainer.ticketService.listTickets).mockRejectedValue(error);
      vi.mocked(diContainer.ticketService.countTickets).mockResolvedValue(0);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: error state
      expect(result.current.error).toBe('Error loading tickets');
    });
  });

  describe('createTicket', () => {
    it('should create ticket and refetch list', async () => {
      const newTicket = new Ticket('3', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'New Ticket' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(diContainer.ticketService.createTicket).mockResolvedValue(newTicket);
      vi.mocked(diContainer.ticketService.listTickets)
        .mockResolvedValueOnce([]) // Initial load
        .mockResolvedValueOnce([newTicket]); // After create
      vi.mocked(diContainer.ticketService.countTickets)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      // Wait for initial load
      await waitFor(() => expect(result.current.loading).toBe(false));

      // Create ticket
      await act(async () => {
        await result.current.createTicket({
          templateId: 't1',
          data: { title: 'New Ticket' },
          metadata: { dev: 'Felipe' },
        });
      });

      // Assert: service was called
      expect(diContainer.ticketService.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: 't1',
          data: { title: 'New Ticket' },
        })
      );

      // Assert: list was refetched
      expect(diContainer.ticketService.listTickets).toHaveBeenCalledTimes(2);

      // Assert: state updated
      await waitFor(() => {
        expect(result.current.tickets).toHaveLength(1);
      });
    });

    it('should handle create errors', async () => {
      const error = new Error('Validation error');
      vi.mocked(diContainer.ticketService.createTicket).mockRejectedValue(error);
      vi.mocked(diContainer.ticketService.listTickets).mockResolvedValue([]);
      vi.mocked(diContainer.ticketService.countTickets).mockResolvedValue(0);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Try to create
      await expect(
        act(async () => {
          await result.current.createTicket({
            templateId: 't1',
            data: {},
            metadata: { dev: 'Felipe' },
          });
        })
      ).rejects.toThrow('Validation error');
    });
  });

  describe('updateTicket', () => {
    it('should update ticket and refetch', async () => {
      const initialTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Original' }, { dev: 'Felipe' }, [], new Date(), new Date());
      const updatedTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Updated' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(diContainer.ticketService.listTickets)
        .mockResolvedValueOnce([initialTicket])
        .mockResolvedValueOnce([updatedTicket]);
      vi.mocked(diContainer.ticketService.countTickets)
        .mockResolvedValue(1);
      vi.mocked(diContainer.ticketService.updateTicket).mockResolvedValue(updatedTicket);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Update ticket
      await act(async () => {
        await result.current.updateTicket('1', { title: 'Updated' });
      });

      expect(diContainer.ticketService.updateTicket).toHaveBeenCalledWith('1', { title: 'Updated' });
      expect(diContainer.ticketService.listTickets).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteTicket', () => {
    it('should delete ticket and refetch', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'To Delete' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(diContainer.ticketService.listTickets)
        .mockResolvedValueOnce([mockTicket])
        .mockResolvedValueOnce([]);
      vi.mocked(diContainer.ticketService.countTickets)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);
      vi.mocked(diContainer.ticketService.deleteTicket).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.tickets).toHaveLength(1);

      // Delete ticket
      await act(async () => {
        await result.current.deleteTicket('1');
      });

      expect(diContainer.ticketService.deleteTicket).toHaveBeenCalledWith('1');
      
      await waitFor(() => {
        expect(result.current.tickets).toHaveLength(0);
      });
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple tickets', async () => {
      const mockResult = {
        successful: ['1', '2'],
        failed: [],
      };

      vi.mocked(diContainer.ticketService.listTickets).mockResolvedValue([]);
      vi.mocked(diContainer.ticketService.countTickets).mockResolvedValue(0);
      vi.mocked(diContainer.ticketService.bulkUpdateStatus).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Bulk update
      await act(async () => {
        await result.current.bulkUpdateTicketStatus(['1', '2'], TicketStatus.COMPLETED);
      });

      expect(diContainer.ticketService.bulkUpdateStatus).toHaveBeenCalledWith(['1', '2'], TicketStatus.COMPLETED);
    });

    it('should handle partial failures in bulk update', async () => {
      const mockResult = {
        successful: ['1'],
        failed: [{ id: '2', ticket: {} as any, error: 'Missing required fields' }],
      };

      vi.mocked(diContainer.ticketService.listTickets).mockResolvedValue([]);
      vi.mocked(diContainer.ticketService.countTickets).mockResolvedValue(0);
      vi.mocked(diContainer.ticketService.bulkUpdateStatus).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useTicketContext(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Bulk update with failures
      const updateResult = await act(async () => {
        return await result.current.bulkUpdateTicketStatus(['1', '2'], TicketStatus.COMPLETED);
      });

      expect(updateResult.successful).toHaveLength(1);
      expect(updateResult.failed).toHaveLength(1);
      expect(updateResult.failed[0].error).toContain('required fields');
    });
  });
});

