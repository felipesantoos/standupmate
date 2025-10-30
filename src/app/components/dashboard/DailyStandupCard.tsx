/**
 * Daily Standup Card Component
 * 
 * Displays daily standup information.
 */

import { Ticket } from '@core/domain/Ticket';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Copy, Download } from 'lucide-react';
import { useExport } from '@app/hooks/useExport';
import { toast } from 'sonner';

interface DailyStandupCardProps {
  yesterdayTickets: Ticket[];
  todayTickets: Ticket[];
  blockers?: string[];
}

export function DailyStandupCard({
  yesterdayTickets,
  todayTickets,
  blockers = [],
}: DailyStandupCardProps) {
  const { generateDailyStandup, downloadAsFile } = useExport();

  const handleCopyToClipboard = async () => {
    const markdown = await generateDailyStandup(yesterdayTickets, todayTickets, blockers);
    await navigator.clipboard.writeText(markdown);
        toast.success('Daily standup copied to clipboard.');
  };

  const handleDownload = async () => {
    const markdown = await generateDailyStandup(yesterdayTickets, todayTickets, blockers);
    const today = new Date().toISOString().split('T')[0];
    downloadAsFile(markdown, `daily-standup-${today}.md`);
    toast.success('Daily standup downloaded.');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Standup</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Yesterday */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">Yesterday (Completed)</h3>
            <Badge variant="secondary">{yesterdayTickets.length}</Badge>
          </div>
          {yesterdayTickets.length > 0 ? (
            <ul className="space-y-2">
              {yesterdayTickets.map((ticket, index) => (
                <li key={ticket.id} className="text-sm flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="flex-1">{ticket.data['title'] || 'Untitled'}</span>
                  {ticket.metadata.actualTime && (
                    <Badge variant="secondary" className="text-xs">
                      {ticket.metadata.actualTime}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No tickets completed yesterday
            </p>
          )}
        </div>
        
        <Separator />

        {/* Today */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">Today (In Progress)</h3>
            <Badge variant="default">{todayTickets.length}</Badge>
          </div>
          {todayTickets.length > 0 ? (
            <ul className="space-y-2">
              {todayTickets.map((ticket, index) => (
                <li key={ticket.id} className="text-sm flex items-start gap-2">
                  <Badge variant="default" className="shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="flex-1">{ticket.data['title'] || 'Untitled'}</span>
                  {ticket.metadata.estimate && (
                    <Badge variant="secondary" className="text-xs">
                      {ticket.metadata.estimate}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No tickets in progress today
            </p>
          )}
        </div>
        
        <Separator />

        {/* Blockers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">Blockers</h3>
            <Badge variant={blockers && blockers.length > 0 ? "destructive" : "outline"}>
              {blockers?.length || 0}
            </Badge>
          </div>
          {blockers && blockers.length > 0 ? (
            <ul className="space-y-2">
              {blockers.map((blocker, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">
                    !
                  </Badge>
                  <span className="flex-1">{blocker}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
              No blockers
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

