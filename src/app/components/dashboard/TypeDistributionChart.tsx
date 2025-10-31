/**
 * Type Distribution Chart Component
 * 
 * Pie chart showing ticket distribution by type.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { TypeDistribution } from '@core/services/AnalyticsService';

interface TypeDistributionChartProps {
  data: TypeDistribution[];
  loading?: boolean;
}

// Monochrome grayscale colors
const COLORS = [
  'hsl(var(--foreground))',      // Dark
  'hsl(var(--muted-foreground))', // Medium
  'hsl(0 0% 65%)',               // Light gray
  'hsl(0 0% 80%)',               // Lighter gray
  'hsl(0 0% 50%)',               // Medium-dark
  'hsl(0 0% 35%)',               // Darker
];

export function TypeDistributionChart({ data, loading }: TypeDistributionChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No data to display</p>
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
          <p className="font-semibold">{data.type}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} tickets ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Show only initials of label text
  const renderLabel = ({ type, percentage }: any) => {
    const initials = type
      .split(/[\s/]+/) // Split by spaces or slashes
      .map((word: string) => word.charAt(0).toUpperCase())
      .join('');
    return `${initials}: ${percentage}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution by Type</CardTitle>
        <CardDescription>Breakdown of tickets by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

