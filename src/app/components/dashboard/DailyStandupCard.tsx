/**
 * Daily Standup Card Component
 * 
 * Displays daily standup information.
 */

import { Ticket } from '@core/domain/Ticket';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Download } from 'lucide-react';
import { useExport } from '@app/hooks/useExport';
import { useToast } from '../ui/Toast';

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
  const toast = useToast();

  const handleCopyToClipboard = async () => {
    const markdown = await generateDailyStandup(yesterdayTickets, todayTickets, blockers);
    await navigator.clipboard.writeText(markdown);
        toast.success('Copied!', 'Daily standup copied to clipboard.');
  };

  const handleDownload = async () => {
    const markdown = await generateDailyStandup(yesterdayTickets, todayTickets, blockers);
    const today = new Date().toISOString().split('T')[0];
    downloadAsFile(markdown, `daily-standup-${today}.md`);
    toast.success('Download iniciado!', 'Daily standup foi baixado.');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📅 Daily Standup</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Yesterday */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">Yesterday (Completed):</h3>
          {yesterdayTickets.length > 0 ? (
            <ul className="space-y-1">
              {yesterdayTickets.map((ticket, index) => (
                <li key={ticket.id} className="text-sm">
                  ✅ <span className="font-medium">#{index + 1}</span>: {ticket.data['title'] || 'Untitled'}
                  {ticket.metadata.actualTime && (
                    <span className="text-muted-foreground ml-2">({ticket.metadata.actualTime})</span>
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

        {/* Today */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">Today (In Progress):</h3>
          {todayTickets.length > 0 ? (
            <ul className="space-y-1">
              {todayTickets.map((ticket, index) => (
                <li key={ticket.id} className="text-sm">
                  🟡 <span className="font-medium">#{index + 1}</span>: {ticket.data['title'] || 'Untitled'}
                  {ticket.metadata.estimate && (
                    <span className="text-muted-foreground ml-2">(Estimate: {ticket.metadata.estimate})</span>
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

        {/* Blockers */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Blockers:</h3>
          {blockers.length > 0 ? (
            <ul className="space-y-1">
              {blockers.map((blocker, index) => (
                <li key={index} className="text-sm">
                  ⚠️ {blocker}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No blockers</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

