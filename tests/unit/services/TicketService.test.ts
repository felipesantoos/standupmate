/**
 * TicketService Unit Tests
 * 
 * Tests business logic with mock repositories.
 * Following 08e-frontend-testing.md pattern (Section 3.2).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketService } from '@core/services/TicketService';
import { ITicketRepository } from '@core/interfaces/secondary/ITicketRepository';
import { ITemplateService } from '@core/interfaces/primary/ITemplateService';
import { Ticket } from '@core/domain/Ticket';
import { Template } from '@core/domain/Template';
import { TicketStatus, FieldType } from '@core/domain/types';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketNotFoundException, InvalidOperationException } from '@core/exceptions/DomainExceptions';

describe('TicketService', () => {
  let service: TicketService;
  let mockTicketRepo: ITicketRepository;
  let mockTemplateService: ITemplateService;

  beforeEach(() => {
    // Mock ticket repository
    mockTicketRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      findByStatus: vi.fn(),
      findByTemplateId: vi.fn(),
      count: vi.fn(),
      exists: vi.fn(),
    } as any;

    // Mock template service
    mockTemplateService = {
      getTemplate: vi.fn(),
      listTemplates: vi.fn(),
      createTemplate: vi.fn(),
      updateTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
    } as any;

    // Inject mocks
    service = new TicketService(mockTicketRepo, mockTemplateService);
  });

  describe('listTickets', () => {
    it('should list all tickets without filter', async () => {
      const mockTickets = [
        new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'T1' }, { dev: 'Felipe' }, [], new Date(), new Date()),
        new Ticket('2', 't1', '1.0.0', TicketStatus.IN_PROGRESS, { title: 'T2' }, { dev: 'Ana' }, [], new Date(), new Date()),
      ];

      vi.mocked(mockTicketRepo.findAll).mockResolvedValue(mockTickets);

      const result = await service.listTickets();

      expect(mockTicketRepo.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });

    it('should list tickets with filter', async () => {
      const filter = new TicketFilter();

      vi.mocked(mockTicketRepo.findAll).mockResolvedValue([]);

      await service.listTickets(filter);

      expect(mockTicketRepo.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('getTicket', () => {
    it('should return ticket when found', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Test' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);

      const result = await service.getTicket('1');

      expect(mockTicketRepo.findById).toHaveBeenCalledWith('1');
      expect(result.id).toBe('1');
    });

    it('should throw TicketNotFoundException when not found', async () => {
      vi.mocked(mockTicketRepo.findById).mockResolvedValue(null);

      await expect(service.getTicket('non-existent')).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('createTicket', () => {
    it('should create ticket with valid data', async () => {
      const newTicket = new Ticket(
        '',
        't1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'New Ticket', description: 'Description' },
        { dev: 'Felipe Santos', estimate: '2h' },
        [],
        new Date(),
        new Date()
      );

      vi.mocked(mockTicketRepo.save).mockImplementation(async (ticket) => {
        ticket.id = 'generated-id';
        return ticket;
      });

      const result = await service.createTicket(newTicket);

      expect(mockTicketRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('generated-id');
      expect(result.data.title).toBe('New Ticket');
    });

    it('should throw validation error for invalid ticket', async () => {
      const invalidTicket = new Ticket(
        '',
        '', // Empty templateId - invalid!
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      await expect(service.createTicket(invalidTicket)).rejects.toThrow('Template ID is required');
    });
  });

  describe('updateTicket', () => {
    it('should update existing ticket', async () => {
      const existingTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Old' }, { dev: 'Felipe' }, [], new Date(), new Date());
      const updatedTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Updated' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(existingTicket);
      vi.mocked(mockTicketRepo.save).mockImplementation(async (ticket) => ticket);

      const result = await service.updateTicket('1', updatedTicket);

      expect(mockTicketRepo.findById).toHaveBeenCalledWith('1');
      expect(mockTicketRepo.save).toHaveBeenCalled();
      expect(result.data.title).toBe('Updated');
    });

    it('should throw error when ticket not found', async () => {
      const updatedTicket = new Ticket('invalid', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Test' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(null);

      await expect(service.updateTicket('invalid', updatedTicket)).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('deleteTicket', () => {
    it('should delete existing ticket', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Test' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);
      vi.mocked(mockTicketRepo.delete).mockResolvedValue(undefined);

      await service.deleteTicket('1');

      expect(mockTicketRepo.findById).toHaveBeenCalledWith('1');
      expect(mockTicketRepo.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when ticket not found', async () => {
      vi.mocked(mockTicketRepo.findById).mockResolvedValue(null);

      await expect(service.deleteTicket('invalid')).rejects.toThrow(TicketNotFoundException);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark ticket as completed when all required fields are filled', async () => {
      const mockTemplate = new Template(
        't1',
        'Test',
        'Test',
        '1.0.0',
        true,
        [
          {
            id: 's1',
            title: 'Section',
            order: 1,
            fields: [
              { id: 'title', label: 'Title', type: FieldType.TEXT, required: true, order: 1 },
              { id: 'description', label: 'Desc', type: FieldType.TEXTAREA, required: false, order: 2 },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Complete Task', description: 'Done' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);
      vi.mocked(mockTemplateService.getTemplate).mockResolvedValue(mockTemplate);
      vi.mocked(mockTicketRepo.save).mockImplementation(async (ticket) => ticket);

      const result = await service.markAsCompleted('1');

      expect(result.status).toBe(TicketStatus.COMPLETED);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error when required fields are missing', async () => {
      const mockTemplate = new Template(
        't1',
        'Test',
        'Test',
        '1.0.0',
        true,
        [
          {
            id: 's1',
            title: 'Section',
            order: 1,
            fields: [
              { id: 'title', label: 'Title', type: FieldType.TEXT, required: true, order: 1 },
              { id: 'description', label: 'Desc', type: FieldType.TEXTAREA, required: true, order: 2 }, // Required!
            ],
          },
        ],
        new Date(),
        new Date()
      );

      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Task' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);
      vi.mocked(mockTemplateService.getTemplate).mockResolvedValue(mockTemplate);

      await expect(service.markAsCompleted('1')).rejects.toThrow(InvalidOperationException);
      await expect(service.markAsCompleted('1')).rejects.toThrow('required fields');
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Test' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);
      vi.mocked(mockTicketRepo.save).mockImplementation(async (ticket) => ticket);

      const result = await service.updateTicketStatus('1', TicketStatus.IN_PROGRESS);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      expect(mockTicketRepo.save).toHaveBeenCalled();
    });
  });

  describe('archiveTicket', () => {
    it('should archive completed ticket', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.COMPLETED, { title: 'Done' }, { dev: 'Felipe' }, [], new Date(), new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);
      vi.mocked(mockTicketRepo.save).mockImplementation(async (ticket) => ticket);

      const result = await service.archiveTicket('1');

      expect(result.status).toBe(TicketStatus.ARCHIVED);
      expect(mockTicketRepo.save).toHaveBeenCalled();
    });

    it('should throw error when trying to archive non-completed ticket', async () => {
      const mockTicket = new Ticket('1', 't1', '1.0.0', TicketStatus.DRAFT, { title: 'Not Done' }, { dev: 'Felipe' }, [], new Date(), new Date());

      vi.mocked(mockTicketRepo.findById).mockResolvedValue(mockTicket);

      await expect(service.archiveTicket('1')).rejects.toThrow('Only completed tickets can be archived');
    });
  });

  describe('getDailyStandupTickets', () => {
    it('should return yesterday and today tickets', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayTickets = [
        new Ticket('1', 't1', '1.0.0', TicketStatus.COMPLETED, { title: 'Yesterday' }, { dev: 'Felipe' }, [], yesterday, yesterday, yesterday),
      ];

      const todayTickets = [
        new Ticket('2', 't1', '1.0.0', TicketStatus.IN_PROGRESS, { title: 'Today' }, { dev: 'Felipe' }, [], new Date(), new Date()),
      ];

      vi.mocked(mockTicketRepo.findAll)
        .mockResolvedValueOnce(yesterdayTickets)
        .mockResolvedValueOnce(todayTickets);

      const result = await service.getDailyStandupTickets();

      expect(result.yesterday).toHaveLength(1);
      expect(result.today).toHaveLength(1);
      expect(mockTicketRepo.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('countTickets', () => {
    it('should count tickets with filter', async () => {
      vi.mocked(mockTicketRepo.count).mockResolvedValue(5);

      const result = await service.countTickets();

      expect(mockTicketRepo.count).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });
});

