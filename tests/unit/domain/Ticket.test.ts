/**
 * Unit Tests for Ticket Domain Model
 * 
 * Following testing best practices from guides:
 * - Test behavior, not implementation
 * - One test = one concern
 * - Descriptive test names
 * - Arrange-Act-Assert pattern
 */

import { describe, it, expect } from 'vitest';
import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';

describe('Ticket Domain Model', () => {
  // ===================================================================
  // VALIDATION TESTS
  // ===================================================================

  describe('validate()', () => {
    it('should pass validation for valid ticket', () => {
      // Arrange
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test Ticket' },
        { dev: 'Felipe Santos', estimate: '2h' },
        ['backend', 'feature'],
        new Date('2025-10-30T10:00:00Z'),
        new Date('2025-10-30T10:00:00Z')
      );

      // Act & Assert
      expect(() => ticket.validate()).not.toThrow();
    });

    it('should throw error when templateId is empty', () => {
      const ticket = new Ticket(
        'ticket-1',
        '', // Empty template ID
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Template ID is required');
    });

    it('should throw error when templateVersion is empty', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '', // Empty version
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Template version is required');
    });

    it('should throw error when data is empty', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        {}, // Empty data
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Ticket must have data');
    });

    it('should throw error when dev name is missing in metadata', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: '' }, // Empty dev name
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Developer name is required in metadata');
    });

    it('should throw error when tags is not an array', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        'invalid' as any, // Not an array
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Tags must be an array');
    });

    it('should throw error for invalid status', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        'invalid_status' as TicketStatus,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.validate()).toThrow('Invalid ticket status');
    });

    it('should throw error when completed ticket has no completedAt date', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date(),
        undefined // No completedAt
      );

      expect(() => ticket.validate()).toThrow('Completed tickets must have completion date');
    });
  });

  // ===================================================================
  // BUSINESS OPERATIONS TESTS
  // ===================================================================

  describe('markAsCompleted()', () => {
    it('should mark draft ticket as completed', () => {
      // Arrange
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date('2025-10-30T10:00:00Z'),
        new Date('2025-10-30T10:00:00Z')
      );

      // Act
      ticket.markAsCompleted();

      // Assert
      expect(ticket.status).toBe(TicketStatus.COMPLETED);
      expect(ticket.completedAt).toBeInstanceOf(Date);
      expect(ticket.updatedAt.getTime()).toBeGreaterThan(
        new Date('2025-10-30T10:00:00Z').getTime()
      );
    });

    it('should throw error when marking already completed ticket', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      expect(() => ticket.markAsCompleted()).toThrow('Ticket is already completed');
    });
  });

  describe('markAsInProgress()', () => {
    it('should mark draft ticket as in progress', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      ticket.markAsInProgress();

      expect(ticket.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw error when moving completed ticket back to in progress', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      expect(() => ticket.markAsInProgress()).toThrow(
        'Cannot move completed ticket back to in progress'
      );
    });
  });

  describe('archive()', () => {
    it('should archive completed ticket', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      ticket.archive();

      expect(ticket.status).toBe(TicketStatus.ARCHIVED);
    });

    it('should throw error when archiving non-completed ticket', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.archive()).toThrow('Only completed tickets can be archived');
    });
  });

  describe('canBeArchived()', () => {
    it('should return true for completed tickets', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      expect(ticket.canBeArchived()).toBe(true);
    });

    it('should return false for non-completed tickets', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.canBeArchived()).toBe(false);
    });
  });

  describe('isEditable()', () => {
    it('should return true for non-archived tickets', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.isEditable()).toBe(true);
    });

    it('should return false for archived tickets', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.ARCHIVED,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.isEditable()).toBe(false);
    });
  });

  // ===================================================================
  // TAG OPERATIONS TESTS
  // ===================================================================

  describe('addTag()', () => {
    it('should add tag to ticket', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      ticket.addTag('backend');

      expect(ticket.tags).toContain('backend');
      expect(ticket.tags.length).toBe(1);
    });

    it('should normalize tags to lowercase', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      ticket.addTag('Backend');

      expect(ticket.tags).toContain('backend');
    });

    it('should not add duplicate tags', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        ['backend'],
        new Date(),
        new Date()
      );

      ticket.addTag('backend');

      expect(ticket.tags.length).toBe(1);
    });

    it('should throw error for empty tag', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(() => ticket.addTag('')).toThrow('Tag cannot be empty');
    });
  });

  describe('removeTag()', () => {
    it('should remove existing tag', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        ['backend', 'frontend'],
        new Date(),
        new Date()
      );

      ticket.removeTag('backend');

      expect(ticket.tags).not.toContain('backend');
      expect(ticket.tags).toContain('frontend');
      expect(ticket.tags.length).toBe(1);
    });

    it('should do nothing when removing non-existent tag', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        ['backend'],
        new Date(),
        new Date()
      );

      ticket.removeTag('non-existent');

      expect(ticket.tags.length).toBe(1);
      expect(ticket.tags).toContain('backend');
    });
  });

  // ===================================================================
  // HELPER METHODS TESTS
  // ===================================================================

  describe('getTimeSpent()', () => {
    it('should return actual time when set', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Test' },
        { dev: 'Felipe', actualTime: '2h 30min' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      expect(ticket.getTimeSpent()).toBe('2h 30min');
    });

    it('should return null when no actual time', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.getTimeSpent()).toBeNull();
    });
  });

  describe('getEstimate()', () => {
    it('should return estimate when set', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe', estimate: '3h' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.getEstimate()).toBe('3h');
    });

    it('should return null when no estimate', () => {
      const ticket = new Ticket(
        'ticket-1',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Test' },
        { dev: 'Felipe' },
        [],
        new Date(),
        new Date()
      );

      expect(ticket.getEstimate()).toBeNull();
    });
  });
});

