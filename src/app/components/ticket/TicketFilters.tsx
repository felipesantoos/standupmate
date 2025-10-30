/**
 * Ticket Filters Component
 * 
 * Filter controls for ticket list.
 */

import { TicketStatus } from '@core/domain/types';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { Search, X } from 'lucide-react';
import { Input } from '@app/components/ui/input';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';

interface TicketFiltersProps {
  filter: TicketFilter;
  onFilterChange: (filter: TicketFilter) => void;
}

export function TicketFilters({ filter, onFilterChange }: TicketFiltersProps) {
  const handleSearchChange = (search: string) => {
    const newFilter = new TicketFilter(
      filter.status,
      filter.templateId,
      filter.tags,
      filter.dateFrom,
      filter.dateTo,
      search,
      filter.page,
      filter.pageSize,
      filter.sortBy,
      filter.sortOrder
    );
    onFilterChange(newFilter);
  };

  const handleStatusChange = (status?: TicketStatus) => {
    const newFilter = new TicketFilter(
      status,
      filter.templateId,
      filter.tags,
      filter.dateFrom,
      filter.dateTo,
      filter.search,
      filter.page,
      filter.pageSize,
      filter.sortBy,
      filter.sortOrder
    );
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    onFilterChange(new TicketFilter());
  };

  const hasActiveFilters = filter.hasAnyFilter();

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tickets..."
            value={filter.search || ''}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={!filter.status ? 'default' : 'outline'}
          onClick={() => handleStatusChange(undefined)}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter.status === TicketStatus.DRAFT ? 'default' : 'outline'}
          onClick={() => handleStatusChange(TicketStatus.DRAFT)}
        >
          Draft
        </Button>
        <Button
          size="sm"
          variant={filter.status === TicketStatus.IN_PROGRESS ? 'default' : 'outline'}
          onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
        >
          In Progress
        </Button>
        <Button
          size="sm"
          variant={filter.status === TicketStatus.COMPLETED ? 'default' : 'outline'}
          onClick={() => handleStatusChange(TicketStatus.COMPLETED)}
        >
          Complete
        </Button>
        <Button
          size="sm"
          variant={filter.status === TicketStatus.ARCHIVED ? 'default' : 'outline'}
          onClick={() => handleStatusChange(TicketStatus.ARCHIVED)}
        >
          Archived
        </Button>
      </div>
    </div>
  );
}

