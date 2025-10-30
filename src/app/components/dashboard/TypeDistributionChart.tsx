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
          <Skeleton className="h-[250px] w-full" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution by Type</CardTitle>
        <CardDescription>Breakdown of tickets by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, percentage }) => `${type}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, entry: any) => {
                return [`${value} tickets (${entry.payload.percentage}%)`, entry.payload.type];
              }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

