/**
 * Analytics Service
 * 
 * Calculates statistics and metrics from tickets.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { parseTimeToMinutes } from '@/utils/formatters';

export interface ProductivityData {
  date: string;
  completed: number;
  created: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface TimeComparison {
  ticketId: string;
  title: string;
  estimated: number; // minutes
  actual: number; // minutes
  variance: number; // percentage
}

export class AnalyticsService {
  /**
   * Get productivity data (tickets per day)
   */
  getProductivityData(tickets: Ticket[], days: number = 7): ProductivityData[] {
    const data: ProductivityData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = tickets.filter(
        (t) =>
          t.completedAt &&
          t.completedAt >= date &&
          t.completedAt < nextDate
      ).length;

      const created = tickets.filter(
        (t) => t.createdAt >= date && t.createdAt < nextDate
      ).length;

      data.push({
        date: date.toISOString().split('T')[0],
        completed,
        created,
      });
    }

    return data;
  }

  /**
   * Get ticket type distribution
   */
  getTypeDistribution(tickets: Ticket[]): TypeDistribution[] {
    const counts: Record<string, number> = {};
    
    tickets.forEach((ticket) => {
      const type = ticket.data['type'] || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = tickets.length || 1;
    
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }

  /**
   * Get time estimate vs actual comparison
   */
  getTimeComparison(tickets: Ticket[]): TimeComparison[] {
    return tickets
      .filter((t) => t.metadata.estimate && t.metadata.actualTime)
      .map((t) => {
        const estimated = parseTimeToMinutes(t.metadata.estimate!);
        const actual = parseTimeToMinutes(t.metadata.actualTime!);
        const variance = estimated > 0 ? Math.round(((actual - estimated) / estimated) * 100) : 0;

        return {
          ticketId: t.id,
          title: t.data['title'] || 'Untitled',
          estimated,
          actual,
          variance,
        };
      });
  }

  /**
   * Get average time by status
   */
  getAverageTimeByStatus(tickets: Ticket[]): Record<TicketStatus, number> {
    const times: Record<TicketStatus, number[]> = {
      [TicketStatus.DRAFT]: [],
      [TicketStatus.IN_PROGRESS]: [],
      [TicketStatus.COMPLETED]: [],
      [TicketStatus.ARCHIVED]: [],
    };

    tickets.forEach((ticket) => {
      if (ticket.metadata.actualTime) {
        const minutes = parseTimeToMinutes(ticket.metadata.actualTime);
        times[ticket.status].push(minutes);
      }
    });

    return {
      [TicketStatus.DRAFT]: this.average(times[TicketStatus.DRAFT]),
      [TicketStatus.IN_PROGRESS]: this.average(times[TicketStatus.IN_PROGRESS]),
      [TicketStatus.COMPLETED]: this.average(times[TicketStatus.COMPLETED]),
      [TicketStatus.ARCHIVED]: this.average(times[TicketStatus.ARCHIVED]),
    };
  }

  /**
   * Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((acc, n) => acc + n, 0) / numbers.length);
  }
}

