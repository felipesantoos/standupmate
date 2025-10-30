/**
 * Status Distribution Chart Component
 * 
 * Bar chart showing ticket distribution by status.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';
import { StatusDistribution } from '@core/services/AnalyticsService';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
  loading?: boolean;
}

// Colors for different statuses
const STATUS_COLORS: Record<string, string> = {
  'Rascunho': 'hsl(var(--muted-foreground))',
  'Em Progresso': 'hsl(var(--chart-1))',
  'Concluído': 'hsl(var(--chart-2))',
  'Arquivado': 'hsl(var(--muted))',
};

export function StatusDistributionChart({ data, loading }: StatusDistributionChartProps) {
  
  if (loading || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Quantidade de tickets em cada status</CardDescription>
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
          className="rounded-lg border bg-card p-3 shadow-sm"
          style={{ 
            backgroundColor: 'hsl(var(--card))', 
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
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription>Quantidade de tickets em cada status</CardDescription>
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
}

