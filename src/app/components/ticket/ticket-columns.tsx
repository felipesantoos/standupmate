/**
 * Ticket Table Columns
 * 
 * Column definitions for @tanstack/react-table.
 * Following 08d-ui-components.md pattern (Section 5.2).
 */

import { ColumnDef } from '@tanstack/react-table';
import { Ticket } from '@core/domain/Ticket';
import { TicketStatus } from '@core/domain/types';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/utils/formatters';

/**
 * Get status text from enum
 */
const getStatusText = (status: TicketStatus) => {
  const statusMap = {
    [TicketStatus.DRAFT]: 'Draft',
    [TicketStatus.IN_PROGRESS]: 'In Progress',
    [TicketStatus.COMPLETED]: 'Completed',
    [TicketStatus.ARCHIVED]: 'Archived',
  };
  return statusMap[status];
};

/**
 * Get badge variant for status
 */
const getStatusVariant = (status: TicketStatus): 'default' | 'secondary' | 'outline' => {
  if (status === TicketStatus.COMPLETED) return 'default';
  if (status === TicketStatus.IN_PROGRESS) return 'secondary';
  return 'outline';
};

/**
 * Ticket Table Columns Definition
 * 
 * Features:
 * - Sortable columns (Title, Created Date)
 * - Status badges with colors
 * - Tags (truncated to 2 + count)
 * - Actions dropdown (View, Edit, Delete)
 */
export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ticket = row.original;
      const title = ticket.getTitle();
      return <div className="font-medium max-w-[300px] truncate">{title}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const ticket = row.original;
      const statusText = getStatusText(ticket.status);
      const variant = getStatusVariant(ticket.status);
      
      return (
        <Badge 
          variant={variant}
          className={ticket.status === TicketStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-200' : ''}
        >
          {statusText}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const ticket = row.original;
      if (ticket.tags.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {ticket.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {ticket.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{ticket.tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(ticket.createdAt)}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const ticket = row.original;
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onView?.(ticket.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onEdit?.(ticket.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(ticket.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

