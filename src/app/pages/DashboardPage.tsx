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
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/Card';
import { DailyStandupCard } from '@app/components/dashboard/DailyStandupCard';
import { ProductivityChart } from '@app/components/dashboard/ProductivityChart';
import { TypeDistributionChart } from '@app/components/dashboard/TypeDistributionChart';
import { Clock, CheckCircle, TrendingUp } from 'lucide-react';

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

  // Daily standup data
  const { yesterdayTickets, todayTickets, loading } = useDailyStandupTickets();

  // Analytics data
  const { productivityData, typeDistribution } = useAnalytics(allTickets);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your work</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-foreground mt-2">{inProgressCount}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed (Week)
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">{completedThisWeek}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {completedThisWeek > 0 ? '↗️' : '-'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProductivityChart data={productivityData} />
        <TypeDistributionChart data={typeDistribution} />
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

