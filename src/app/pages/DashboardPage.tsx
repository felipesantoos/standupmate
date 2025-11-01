/**
 * Dashboard Page
 * 
 * Overview of tickets and daily standup.
 * Connected with hooks.
 */

import { useMemo, useEffect, useState } from 'react';
import { useDailyStandupTickets } from '@app/hooks/useTickets';
import { useAnalytics } from '@app/hooks/useAnalytics';
import { TicketStatus } from '@core/domain/types';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketBlocker } from '@core/interfaces/primary/IExportService';
import { Ticket } from '@core/domain/Ticket';
import { diContainer } from '@app/dicontainer/dicontainer';
import { MetricsCards } from '@app/components/dashboard/MetricsCards';
import { DailyStandupCard } from '@app/components/dashboard/DailyStandupCard';
import { ProductivityChart } from '@app/components/dashboard/ProductivityChart';
import { TypeDistributionChart } from '@app/components/dashboard/TypeDistributionChart';
import { StatusDistributionChart } from '@app/components/dashboard/StatusDistributionChart';

export function DashboardPage() {
  // Local state for dashboard metrics
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get service from DI Container for dashboard-specific queries
  const ticketService = diContainer.ticketService;

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Create filters
        const allTicketsFilter = new TicketFilter();
        const inProgressFilter = new TicketFilter(TicketStatus.IN_PROGRESS);
        const draftFilter = new TicketFilter(TicketStatus.DRAFT);
        const completedThisWeekFilter = new TicketFilter(
          TicketStatus.COMPLETED,
          undefined,
          undefined,
          getWeekStart(),
          new Date()
        );

        // Fetch all data in parallel
        const [all, total, inProgress, draft, completedWeek] = await Promise.all([
          ticketService.listTickets(allTicketsFilter),
          ticketService.countTickets(allTicketsFilter),
          ticketService.countTickets(inProgressFilter),
          ticketService.countTickets(draftFilter),
          ticketService.countTickets(completedThisWeekFilter),
        ]);

        setAllTickets(all);
        setTotalCount(total);
        setInProgressCount(inProgress);
        setDraftCount(draft);
        setCompletedThisWeek(completedWeek);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [ticketService]);

  // Daily standup data (uses specialized hook)
  const { yesterdayTickets, todayTickets, loading: standupLoading } = useDailyStandupTickets();

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
        loading={loading || standupLoading}
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

