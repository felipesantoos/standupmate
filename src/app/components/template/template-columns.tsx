/**
 * Template Table Columns
 * 
 * Column definitions for @tanstack/react-table.
 * Following 08d-ui-components.md pattern (Section 5.2).
 */

import { ColumnDef } from '@tanstack/react-table';
import { Template } from '@core/domain/Template';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@app/components/ui/dropdown-menu';

/**
 * Template Table Columns Definition
 * 
 * Features:
 * - Sortable: Name
 * - Default indicator (star icon)
 * - Version badge
 * - Field/Section count
 * - Actions dropdown (Edit, Set Default, Delete)
 */
export const templateColumns: ColumnDef<Template>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const template = row.original;
      return (
        <div className="flex items-center gap-2">
          {template.isDefault && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-label="Default template" />
          )}
          <span className="font-medium">{template.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => {
      const template = row.original;
      return <Badge variant="outline">{template.version}</Badge>;
    },
  },
  {
    accessorKey: 'sections',
    header: 'Structure',
    cell: ({ row }) => {
      const template = row.original;
      const totalFields = template.sections.reduce((acc, s) => acc + s.fields.length, 0);
      return (
        <div className="text-sm text-muted-foreground">
          {template.sections.length} section{template.sections.length !== 1 ? 's' : ''}, {totalFields} field{totalFields !== 1 ? 's' : ''}
        </div>
      );
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => {
      const template = row.original;
      return <div className="text-sm">{template.author || '-'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const template = row.original;
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
            <DropdownMenuItem onClick={() => meta?.onEdit?.(template.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {!template.isDefault && (
              <DropdownMenuItem onClick={() => meta?.onSetDefault?.(template.id)}>
                <Star className="mr-2 h-4 w-4" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(template.id)}
              className="text-destructive"
              disabled={template.isDefault}
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

