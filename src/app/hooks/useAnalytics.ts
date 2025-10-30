/**
 * useAnalytics Hook
 * 
 * Hook for analytics and statistics.
 */

import { useMemo } from 'react';
import { Ticket } from '@core/domain/Ticket';
import { AnalyticsService } from '@core/services/AnalyticsService';

export function useAnalytics(tickets: Ticket[]) {
  const analytics = useMemo(() => new AnalyticsService(), []);

  const productivityData = useMemo(
    () => analytics.getProductivityData(tickets, 7),
    [analytics, tickets]
  );

  const typeDistribution = useMemo(
    () => analytics.getTypeDistribution(tickets),
    [analytics, tickets]
  );

  const timeComparison = useMemo(
    () => analytics.getTimeComparison(tickets),
    [analytics, tickets]
  );

  const averageTimeByStatus = useMemo(
    () => analytics.getAverageTimeByStatus(tickets),
    [analytics, tickets]
  );

  const statusDistribution = useMemo(
    () => analytics.getStatusDistribution(tickets),
    [analytics, tickets]
  );

  return {
    productivityData,
    typeDistribution,
    timeComparison,
    averageTimeByStatus,
    statusDistribution,
  };
}

