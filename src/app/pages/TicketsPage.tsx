/**
 * Tickets Page
 * 
 * List and manage tickets.
 * Connected with useTickets hook.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useTickets } from '@app/hooks/useTickets';
import { useTemplates } from '@app/hooks/useTemplates';
import { useExport } from '@app/hooks/useExport';
import { useViewMode } from '@app/hooks/useViewMode';
import { toast } from 'sonner';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import { Ticket } from '@core/domain/Ticket';
import { TicketList } from '@app/components/ticket/TicketList';
import { TicketFilters } from '@app/components/ticket/TicketFilters';
import { BatchActions } from '@app/components/ticket/BatchActions';
import { BulkUpdateResultModal } from '@app/components/ticket/BulkUpdateResultModal';
import { DataTable } from '@app/components/common/DataTable';
import { ticketColumns } from '@app/components/ticket/ticket-columns';
import { Button } from '@app/components/ui/button';

export function TicketsPage() {
  const navigate = useNavigate();
  
  // Local UI state
  const [filter, setFilter] = useState<TicketFilter>(new TicketFilter());
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bulkUpdateFailed, setBulkUpdateFailed] = useState<Array<{ id: string; ticket: Ticket; error: string }>>([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  
  // View mode (cards or table)
  const [viewMode, setViewMode] = useViewMode('tickets', 'cards');
  
  // Context (Primary Adapter) - todas as operações vêm daqui
  const {
    tickets,
    loading,
    totalCount,
    fetchTickets,
    deleteTicket,
    archiveTicket,
    updateTicketStatus,
    bulkUpdateTicketStatus,
  } = useTickets();
  
  const { templates } = useTemplates();
  const { exportTicketsToMarkdown, downloadAsFile } = useExport();

  // Fetch tickets when filter changes
  useEffect(() => {
    fetchTickets(filter);
  }, [fetchTickets, JSON.stringify(filter)]); // Re-fetch quando filter mudar

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
      
      toast.success(`${results.length} ticket(s) exported.`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedTickets.length} ticket(s)?`)) return;

    try {
      await Promise.all(selectedTickets.map((id) => deleteTicket(id)));
      toast.success(`${selectedTickets.length} ticket(s) deleted.`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Batch mark complete
  const handleBatchComplete = async () => {
    try {
      const result = await bulkUpdateTicketStatus(selectedTickets, TicketStatus.COMPLETED);
      
      // Check if there were failures
      if (result.failed.length > 0) {
        setBulkUpdateFailed(result.failed);
        setShowBulkUpdateModal(true);
        
        // Show partial success message if some succeeded
        if (result.successful.length > 0) {
          toast.success(`${result.successful.length} ticket(s) marked as completed. ${result.failed.length} failed.`);
        }
      } else {
        // All successful
        toast.success(`${result.successful.length} ticket(s) marked as completed.`);
      }
      
      setSelectedTickets([]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Batch archive
  const handleBatchArchive = async () => {
    try {
      await Promise.all(selectedTickets.map((id) => archiveTicket(id)));
      toast.success(`${selectedTickets.length} ticket(s) archived.`);
      setSelectedTickets([]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Handle status change inline
  const handleStatusChange = async (ticketId: string, status: any) => {
    try {
      await updateTicketStatus(ticketId, status);
    } catch (error) {
      toast.error((error as Error).message);
      throw error; // Re-throw to let TicketCard show the error
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status: TicketStatus) => {
    try {
      const result = await bulkUpdateTicketStatus(selectedTickets, status);
      
      // Check if there were failures
      if (result.failed.length > 0) {
        setBulkUpdateFailed(result.failed);
        setShowBulkUpdateModal(true);
        
        // Show partial success message if some succeeded
        if (result.successful.length > 0) {
          toast.success(`${result.successful.length} ticket(s) updated. ${result.failed.length} failed.`);
        }
      } else {
        // All successful
        toast.success(`${result.successful.length} ticket(s) updated.`);
      }
      
      setSelectedTickets([]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // Handlers for table view
  const handleView = useCallback((id: string) => {
    navigate(`/tickets/${id}`);
  }, [navigate]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/tickets/${id}`);
  }, [navigate]);

  const handleDeleteSingle = useCallback(async (id: string) => {
    if (!confirm('Delete this ticket?')) return;
    
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [deleteTicket]);

  return (
    <div role="main" aria-label="Tickets page">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1" aria-live="polite">
            {totalCount > 0
              ? `${totalCount} ticket${totalCount > 1 ? 's' : ''} ${filter.hasAnyFilter() ? 'found' : 'total'}`
              : 'Manage your work tickets'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md" role="group" aria-label="View mode">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              aria-label="Card view"
              aria-pressed={viewMode === 'cards'}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              className="rounded-l-none"
            >
              <TableIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <Link to="/tickets/new">
            <Button size="default" aria-label="Create new ticket">
              <Plus className="w-5 h-5" aria-hidden="true" />
              New Ticket
            </Button>
          </Link>
        </div>
      </header>

      {/* Filters Section */}
      <section aria-label="Ticket filters" className="mb-6">
        <TicketFilters filter={filter} onFilterChange={setFilter} />
      </section>

      {/* Ticket List Section */}
      <section aria-label="Ticket list" aria-busy={loading}>
        {loading && (
          <div role="status" aria-live="polite">
            <span className="sr-only">Loading tickets...</span>
          </div>
        )}
        
        {viewMode === 'cards' ? (
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
            onStatusChange={handleStatusChange}
          />
        ) : (
          <DataTable<Ticket, unknown>
            columns={ticketColumns}
            data={tickets}
            searchKey="title"
            searchPlaceholder="Search tickets..."
            onRowClick={(ticket) => handleView(ticket.id)}
            meta={{
              onView: handleView,
              onEdit: handleEdit,
              onDelete: handleDeleteSingle,
            }}
          />
        )}
      </section>

      {/* Batch Actions */}
      {selectedTickets.length > 0 && (
        <BatchActions
          selectedCount={selectedTickets.length}
          onExport={handleBatchExport}
          onDelete={handleBatchDelete}
          onArchive={handleBatchArchive}
          onMarkComplete={handleBatchComplete}
          onClearSelection={() => setSelectedTickets([])}
          onStatusChange={handleBulkStatusChange}
        />
      )}

      {/* Bulk Update Result Modal */}
      <BulkUpdateResultModal
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
        failed={bulkUpdateFailed}
      />
    </div>
  );
}

