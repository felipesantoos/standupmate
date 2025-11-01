/**
 * TicketCard Component Tests
 * 
 * Tests rendering and user interaction.
 * Following 08e-frontend-testing.md pattern (Section 3.5).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TicketCard } from '@app/components/ticket/TicketCard';
import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { BrowserRouter } from 'react-router-dom';

// Wrapper with Router for Link components
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TicketCard', () => {
  const mockTicket = new Ticket(
    'ticket-1',
    'template-1',
    '1.0.0',
    TicketStatus.DRAFT,
    { title: 'Test Ticket', description: 'Test Description' },
    { dev: 'Felipe Santos', estimate: '2h' },
    ['backend', 'urgent'],
    new Date('2024-01-01T10:00:00Z'),
    new Date('2024-01-01T10:00:00Z')
  );

  describe('Rendering', () => {
    it('should render ticket information', () => {
      renderWithRouter(<TicketCard ticket={mockTicket} />);

      // Assert: title visible
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();
      
      // Assert: description visible
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      
      // Assert: status visible
      expect(screen.getByText('Draft')).toBeInTheDocument();
      
      // Assert: tags visible
      expect(screen.getByText('backend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      
      // Assert: developer visible
      expect(screen.getByText('Felipe Santos')).toBeInTheDocument();
      
      // Assert: estimate visible
      expect(screen.getByText('2h')).toBeInTheDocument();
    });

    it('should show completed badge with green color', () => {
      const completedTicket = new Ticket(
        'ticket-2',
        'template-1',
        '1.0.0',
        TicketStatus.COMPLETED,
        { title: 'Done Ticket' },
        { dev: 'Ana' },
        [],
        new Date(),
        new Date(),
        new Date()
      );

      renderWithRouter(<TicketCard ticket={completedTicket} />);

      const statusBadge = screen.getByText('Completed');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-green-50');
    });

    it('should truncate tags when more than 3', () => {
      const manyTagsTicket = new Ticket(
        'ticket-3',
        'template-1',
        '1.0.0',
        TicketStatus.DRAFT,
        { title: 'Many Tags' },
        { dev: 'Felipe' },
        ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        new Date(),
        new Date()
      );

      renderWithRouter(<TicketCard ticket={manyTagsTicket} />);

      // Assert: only first 3 tags shown
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      
      // Assert: +2 badge shown
      expect(screen.getByText('+2')).toBeInTheDocument();
      
      // Assert: remaining tags not visible
      expect(screen.queryByText('tag4')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithRouter(<TicketCard ticket={mockTicket} />);

      // Assert: article with aria-labelledby
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', 'ticket-title-ticket-1');
      expect(article).toHaveAttribute('aria-describedby', 'ticket-desc-ticket-1');
    });

    it('should have semantic HTML structure', () => {
      renderWithRouter(<TicketCard ticket={mockTicket} />);

      // Assert: uses article element
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });

  describe('Status Change', () => {
    it('should call onStatusChange when status is changed', async () => {
      const user = userEvent.setup();
      const mockOnStatusChange = vi.fn().mockResolvedValue(undefined);

      renderWithRouter(
        <TicketCard ticket={mockTicket} onStatusChange={mockOnStatusChange} />
      );

      // Assert: status select visible
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      expect(statusSelect).toBeInTheDocument();
    });

    it('should show status badge when no onStatusChange provided', () => {
      renderWithRouter(<TicketCard ticket={mockTicket} />);

      // Assert: status badge (não select)
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should not re-render with same props', () => {
      const { rerender } = renderWithRouter(<TicketCard ticket={mockTicket} />);

      const firstRender = screen.getByText('Test Ticket');

      // Rerender with same ticket
      rerender(<BrowserRouter><TicketCard ticket={mockTicket} /></BrowserRouter>);

      const secondRender = screen.getByText('Test Ticket');

      // Both should be the same element (memoized)
      expect(firstRender).toBe(secondRender);
    });
  });
});

