/**
 * Dashboard Page
 * 
 * Overview of tickets and daily standup.
 * Connected with hooks.
 */

import { useMemo } from 'react';
import { useTickets, useDailyStandupTickets } from '@app/hooks/useTickets';
import { useAnalytics } from '@app/hooks/useAnalytics';
import { TicketStatus } from '@core/domain/types';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketBlocker } from '@core/interfaces/primary/IExportService';
import { MetricsCards } from '@app/components/dashboard/MetricsCards';
import { DailyStandupCard } from '@app/components/dashboard/DailyStandupCard';
import { ProductivityChart } from '@app/components/dashboard/ProductivityChart';
import { TypeDistributionChart } from '@app/components/dashboard/TypeDistributionChart';
import { StatusDistributionChart } from '@app/components/dashboard/StatusDistributionChart';

export function DashboardPage() {
  // Memoize filters to prevent infinite rerenders
  const allTicketsFilter = useMemo(() => new TicketFilter(), []);
  const inProgressFilter = useMemo(() => new TicketFilter(TicketStatus.IN_PROGRESS), []);
  const draftFilter = useMemo(() => new TicketFilter(TicketStatus.DRAFT), []);
  const completedThisWeekFilter = useMemo(
    () => new TicketFilter(
      TicketStatus.COMPLETED,
      undefined,
      undefined,
      getWeekStart(),
      new Date()
    ),
    []
  );

  // Get all tickets for analytics
  const { tickets: allTickets } = useTickets(allTicketsFilter, true);

  // Get stats
  const { totalCount: inProgressCount } = useTickets(inProgressFilter, true);
  const { totalCount: completedThisWeek } = useTickets(completedThisWeekFilter, true);
  const { totalCount: draftCount } = useTickets(draftFilter, true);
  const { totalCount } = useTickets(allTicketsFilter, true);

  // Daily standup data
  const { yesterdayTickets, todayTickets, loading } = useDailyStandupTickets();

  // Extract blockers from today's tickets
  const blockers = useMemo(() => {
    const blockersList: TicketBlocker[] = [];
    
    todayTickets.forEach((ticket) => {
      if (ticket.hasBlocker()) {
        const blockerText = ticket.getBlocker();
        if (blockerText) {
          blockersList.push({
            ticketId: ticket.id,
            ticketTitle: ticket.getTitle(),
            blocker: blockerText,
          });
        }
      }
    });
    
    return blockersList;
  }, [todayTickets]);

  // Analytics data
  const { productivityData, typeDistribution, statusDistribution } = useAnalytics(allTickets);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your work</p>
      </div>

      {/* Stats Cards */}
      <MetricsCards
        inProgressCount={inProgressCount}
        completedThisWeek={completedThisWeek}
        totalCount={totalCount}
        draftCount={draftCount}
        loading={loading}
      />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProductivityChart data={productivityData} loading={loading} />
        <TypeDistributionChart data={typeDistribution} loading={loading} />
        <StatusDistributionChart data={statusDistribution} loading={loading} />
      </div>

      {/* Daily Standup */}
      <DailyStandupCard
        yesterdayTickets={yesterdayTickets}
        todayTickets={todayTickets}
        blockers={blockers}
      />
    </div>
  );
}

/**
 * Helper: Get start of current week
 */
function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

