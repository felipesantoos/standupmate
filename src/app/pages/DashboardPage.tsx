/**
 * Dashboard Page
 * 
 * Overview of tickets and daily standup.
 * Connected with hooks.
 */

import { useTickets, useDailyStandupTickets } from '@app/hooks/useTickets';
import { useAnalytics } from '@app/hooks/useAnalytics';
import { TicketStatus } from '@core/domain/types';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { MetricsCards } from '@app/components/dashboard/MetricsCards';
import { DailyStandupCard } from '@app/components/dashboard/DailyStandupCard';
import { ProductivityChart } from '@app/components/dashboard/ProductivityChart';
import { TypeDistributionChart } from '@app/components/dashboard/TypeDistributionChart';

export function DashboardPage() {
  // Get all tickets for analytics
  const { tickets: allTickets } = useTickets(new TicketFilter(), true);

  // Get stats
  const { totalCount: inProgressCount } = useTickets(
    new TicketFilter(TicketStatus.IN_PROGRESS),
    true
  );

  const { totalCount: completedThisWeek } = useTickets(
    new TicketFilter(
      TicketStatus.COMPLETED,
      undefined,
      undefined,
      getWeekStart(),
      new Date()
    ),
    true
  );

  const { totalCount: draftCount } = useTickets(
    new TicketFilter(TicketStatus.DRAFT),
    true
  );

  const { totalCount } = useTickets(new TicketFilter(), true);

  // Daily standup data
  const { yesterdayTickets, todayTickets, loading } = useDailyStandupTickets();

  // Analytics data
  const { productivityData, typeDistribution } = useAnalytics(allTickets);

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
      <div className="grid gap-4 md:grid-cols-2">
        <ProductivityChart data={productivityData} loading={loading} />
        <TypeDistributionChart data={typeDistribution} loading={loading} />
      </div>

      {/* Daily Standup */}
      <DailyStandupCard
        yesterdayTickets={yesterdayTickets}
        todayTickets={todayTickets}
        blockers={[]}
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

