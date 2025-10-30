/**
 * Tickets Page
 * 
 * List and manage tickets.
 * Connected with useTickets hook.
 */

import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTickets } from '@app/hooks/useTickets';
import { useTemplates } from '@app/hooks/useTemplates';
import { useExport } from '@app/hooks/useExport';
import { useToast } from '@app/components/ui/Toast';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketList } from '@app/components/ticket/TicketList';
import { TicketFilters } from '@app/components/ticket/TicketFilters';
import { BatchActions } from '@app/components/ticket/BatchActions';
import { Button } from '@app/components/ui/Button';

export function TicketsPage() {
  const [filter, setFilter] = useState<TicketFilter>(new TicketFilter());
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  
  const { tickets, loading, error, totalCount, deleteTicket, markAsCompleted, archiveTicket } = useTickets(filter);
  const { templates } = useTemplates();
  const { exportTicketsToMarkdown, downloadAsFile } = useExport();
  const toast = useToast();

  // Batch export
  const handleBatchExport = async () => {
    const selected = tickets.filter((t) => selectedTickets.includes(t.id));
    const templateMap = new Map(templates.map((t) => [t.id, t]));

    try {
      const results = await exportTicketsToMarkdown(selected, templateMap);
      
      // Create ZIP or download individually
      if (results.length === 1) {
        downloadAsFile(results[0].markdown, results[0].filename);
      } else {
        // TODO: Create ZIP file
        // For now, download first one as example
        results.forEach((result, index) => {
          setTimeout(() => {
            downloadAsFile(result.markdown, result.filename);
          }, index * 100);
        });
      }
      
      toast.success('Exported!', `${results.length} ticket(s) exported.`);
    } catch (error) {
      toast.error('Error', (error as Error).message);
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedTickets.length} ticket(s)?`)) return;

    try {
      await Promise.all(selectedTickets.map((id) => deleteTicket(id)));
      toast.success('Deleted!', `${selectedTickets.length} ticket(s) deleted.`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error('Error', (error as Error).message);
    }
  };

  // Batch mark complete
  const handleBatchComplete = async () => {
    try {
      await Promise.all(selectedTickets.map((id) => markAsCompleted(id)));
      toast.success('Completed!', `${selectedTickets.length} ticket(s) marked as complete.`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error('Error', (error as Error).message);
    }
  };

  // Batch archive
  const handleBatchArchive = async () => {
    try {
      await Promise.all(selectedTickets.map((id) => archiveTicket(id)));
      toast.success('Archived!', `${selectedTickets.length} ticket(s) archived.`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error('Error', (error as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground mt-2">
            {totalCount > 0
              ? `${totalCount} ticket${totalCount > 1 ? 's' : ''} ${filter.hasAnyFilter() ? 'found' : 'total'}`
              : 'Manage your work tickets'}
          </p>
        </div>

        <Link to="/tickets/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TicketFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
          <p className="font-medium">Error loading tickets:</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      {/* Ticket List */}
      <TicketList
        tickets={tickets}
        loading={loading}
        emptyMessage={
          filter.hasAnyFilter()
            ? 'No tickets found with these filters'
            : 'No tickets created yet. Click "New Ticket" to get started.'
        }
        selectedTickets={selectedTickets}
        onSelectionChange={setSelectedTickets}
      />

      {/* Batch Actions */}
      <BatchActions
        selectedCount={selectedTickets.length}
        onExport={handleBatchExport}
        onDelete={handleBatchDelete}
        onArchive={handleBatchArchive}
        onMarkComplete={handleBatchComplete}
        onClearSelection={() => setSelectedTickets([])}
      />
    </div>
  );
}

