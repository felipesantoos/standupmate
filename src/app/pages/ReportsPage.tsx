/**
 * Reports Page
 * 
 * Weekly and monthly reports with analytics.
 */

import { useMemo } from 'react';
import { useTickets } from '@app/hooks/useTickets';
import { useAnalytics } from '@app/hooks/useAnalytics';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { ProductivityChart } from '@app/components/dashboard/ProductivityChart';
import { TypeDistributionChart } from '@app/components/dashboard/TypeDistributionChart';
import { StatusDistributionChart } from '@app/components/dashboard/StatusDistributionChart';
import { Download } from 'lucide-react';

export function ReportsPage() {
  // Memoize filter without date restrictions
  const filter = useMemo(
    () => new TicketFilter(undefined, undefined, undefined, undefined, undefined),
    []
  );
  
  const { tickets, loading, totalCount } = useTickets(filter, true);
  const { productivityData, typeDistribution, timeComparison, statusDistribution } = useAnalytics(tickets);

  const completedCount = tickets.filter((t) => t.status === TicketStatus.COMPLETED).length;
  const inProgressCount = tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;

  const avgEstimateAccuracy = timeComparison.length > 0
    ? Math.round(
        timeComparison.reduce((acc, t) => acc + Math.abs(t.variance), 0) / timeComparison.length
      )
    : 0;

  const exportReport = () => {
    const report = `# Report - All Time

**Generated:** ${new Date().toLocaleDateString('en-US')}

## 📊 Summary

- **Total Tickets:** ${totalCount}
- **Completed:** ${completedCount}
- **In Progress:** ${inProgressCount}
- **Completion Rate:** ${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
- **Estimate Accuracy:** ${avgEstimateAccuracy}% average deviation

## 📈 Distribution by Type

${typeDistribution.map((t) => `- **${t.type}:** ${t.count} (${t.percentage}%)`).join('\n')}

## ⏱️ Time Comparison (Estimated vs Actual)

${timeComparison
  .slice(0, 10)
  .map(
    (t) =>
      `- **${t.title}**\n  - Estimated: ${t.estimated}min | Actual: ${t.actual}min | Variance: ${t.variance}%`
  )
  .join('\n\n')}

---
*Auto-generated on ${new Date().toLocaleString('en-US')}*
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Analytics and statistics of your work
          </p>
        </div>

        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
            Export Report
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <ProductivityChart data={productivityData} />
        <TypeDistributionChart data={typeDistribution} />
        <StatusDistributionChart data={statusDistribution} loading={loading} />
      </div>

      {/* Time Comparison Table */}
      {timeComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison: Estimated vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-sm font-medium">Ticket</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Estimated</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Actual</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {timeComparison.slice(0, 10).map((t, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 px-4 text-sm">{t.title}</td>
                      <td className="py-2 px-4 text-sm text-right">{t.estimated}min</td>
                      <td className="py-2 px-4 text-sm text-right">{t.actual}min</td>
                      <td
                        className={`py-2 px-4 text-sm text-right font-medium ${
                          t.variance > 0 ? 'text-red-500' : 'text-green-500'
                        }`}
                      >
                        {t.variance > 0 ? '+' : ''}
                        {t.variance}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

