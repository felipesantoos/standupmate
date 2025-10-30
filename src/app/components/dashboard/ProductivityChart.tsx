/**
 * Productivity Chart Component
 * 
 * Shows tickets created and completed per day.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ProductivityData } from '@core/services/AnalyticsService';

interface ProductivityChartProps {
  data: ProductivityData[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <Card>
      <CardHeader>
            <CardTitle>Productivity (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))" 
              name="Completed"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="hsl(var(--muted-foreground))" 
              name="Created"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

