/**
 * Daily Standup Card Component
 * 
 * Displays daily standup information.
 */

import { Ticket } from '@core/domain/Ticket';
import { TicketBlocker } from '@core/interfaces/primary/IExportService';
import { Card, CardHeader, CardTitle, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@app/components/ui/collapsible';
import { Copy, Download, ChevronDown, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useExport } from '@app/hooks/useExport';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface DailyStandupCardProps {
  yesterdayTickets: Ticket[];
  todayTickets: Ticket[];
  blockers?: TicketBlocker[];
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
        {/* Recently Completed */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 mb-2 w-full hover:opacity-70 transition-opacity">
            <h3 className="font-semibold text-foreground">Recently Completed (Last 7 days)</h3>
            <Badge variant="secondary">{yesterdayTickets.length}</Badge>
            <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {yesterdayTickets.length > 0 ? (
              <ul className="space-y-2">
                {yesterdayTickets.map((ticket) => (
                  <li key={ticket.id} className="text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <Link 
                        to={`/tickets/${ticket.id}`}
                        className="hover:text-primary hover:underline transition-colors block"
                      >
                        {ticket.getTitle()}
                      </Link>
                      {ticket.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Completed: {ticket.completedAt.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
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
                No tickets completed in the last 7 days
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        <Separator />

        {/* Today */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 mb-2 w-full hover:opacity-70 transition-opacity">
            <h3 className="font-semibold text-foreground">Today (In Progress)</h3>
            <Badge variant="default">{todayTickets.length}</Badge>
            <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {todayTickets.length > 0 ? (
              <ul className="space-y-2">
                {todayTickets.map((ticket) => (
                  <li key={ticket.id} className="text-sm flex items-start gap-3">
                    <Loader2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <Link 
                      to={`/tickets/${ticket.id}`}
                      className="flex-1 hover:text-primary hover:underline transition-colors"
                    >
                      {ticket.getTitle()}
                    </Link>
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
          </CollapsibleContent>
        </Collapsible>
        
        <Separator />

        {/* Blockers */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 mb-2 w-full hover:opacity-70 transition-opacity">
            <h3 className="font-semibold text-foreground">Blockers</h3>
            <Badge variant={blockers && blockers.length > 0 ? "destructive" : "outline"}>
              {blockers?.length || 0}
            </Badge>
            <ChevronDown className="h-4 w-4 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            {blockers && blockers.length > 0 ? (
              <ul className="space-y-3">
                {blockers.map((blockerItem, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Link 
                          to={`/tickets/${blockerItem.ticketId}`}
                          className="font-medium hover:text-primary hover:underline transition-colors block"
                        >
                          {blockerItem.ticketTitle}
                        </Link>
                        <p className="text-muted-foreground pl-0">
                          {blockerItem.blocker}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                No blockers
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

