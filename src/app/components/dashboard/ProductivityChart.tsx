/**
 * Productivity Chart Component
 * 
 * Shows tickets created and completed per day.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { ProductivityData } from '@core/services/AnalyticsService';

interface ProductivityChartProps {
  data: ProductivityData[];
  loading?: boolean;
}

export function ProductivityChart({ data, loading }: ProductivityChartProps) {
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg border bg-popover p-3 shadow-sm text-popover-foreground"
          style={{ 
            backgroundColor: 'hsl(var(--popover))', 
            border: '1px solid hsl(var(--border))',
          }}
        >
          <p className="font-semibold mb-2">{new Date(label).toLocaleDateString('en-US')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity</CardTitle>
        <CardDescription>Tickets created vs completed (Last 7 Days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickLine={false}
              axisLine={false}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis className="text-xs" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--foreground))" 
              name="Completed"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="hsl(var(--muted-foreground))" 
              name="Created"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--muted-foreground))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

