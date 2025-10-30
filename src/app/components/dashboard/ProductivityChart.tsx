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
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US')}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
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

