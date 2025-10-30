/**
 * Metrics Cards Component
 * Displays dashboard metrics in modern shadcn/ui cards with gradients
 */
import { Clock, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@app/components/ui/card';
import { Skeleton } from '@app/components/ui/skeleton';

interface MetricsCardsProps {
  inProgressCount: number;
  completedThisWeek: number;
  totalCount: number;
  draftCount: number;
  loading?: boolean;
}

export function MetricsCards({ 
  inProgressCount, 
  completedThisWeek, 
  totalCount,
  draftCount,
  loading 
}: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 mt-2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-3 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Tickets',
      value: totalCount,
      subtitle: 'All tickets',
      icon: FileText,
      footer: 'Overall',
      description: `${draftCount} drafts`,
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      subtitle: 'Active work',
      icon: Clock,
      footer: 'Current status',
      description: 'Being worked on',
    },
    {
      title: 'Completed (Week)',
      value: completedThisWeek,
      subtitle: 'Last 7 days',
      icon: CheckCircle,
      footer: 'Weekly progress',
      description: 'Tickets done',
    },
    {
      title: 'Productivity',
      value: completedThisWeek > 0 ? '↗️' : '-',
      subtitle: 'Trend',
      icon: TrendingUp,
      footer: 'Performance',
      description: completedThisWeek > 0 ? 'Going up' : 'No activity',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index} className="@container/card bg-gradient-to-t from-primary/5 to-card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footer} <Icon className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground">{card.description}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

