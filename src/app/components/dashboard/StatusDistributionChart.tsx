/**
 * Status Distribution Chart Component
 * 
 * Bar chart showing ticket distribution by status.
 * Memoized for performance.
 */

import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { StatusDistribution } from '@core/services/AnalyticsService';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
  loading?: boolean;
}

// Colors for different statuses
const STATUS_COLORS: Record<string, string> = {
  'Draft': 'hsl(var(--muted-foreground))',
  'In Progress': 'hsl(var(--chart-1))',
  'Completed': 'hsl(var(--chart-2))',
  'Archived': 'hsl(var(--muted))',
};

const StatusDistributionChartComponent = ({ data, loading }: StatusDistributionChartProps) => {
  
  if (loading || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Status</CardTitle>
          <CardDescription>Number of tickets in each status</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="rounded-lg border bg-popover p-3 shadow-sm text-popover-foreground"
          style={{ 
            backgroundColor: 'hsl(var(--popover))', 
            border: '1px solid hsl(var(--border))',
          }}
        >
          <p className="font-semibold">{data.status}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} tickets ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution by Status</CardTitle>
        <CardDescription>Number of tickets in each status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="status" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status] || 'hsl(var(--foreground))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Memoized StatusDistributionChart
 */
export const StatusDistributionChart = memo(StatusDistributionChartComponent);

StatusDistributionChart.displayName = 'StatusDistributionChart';

