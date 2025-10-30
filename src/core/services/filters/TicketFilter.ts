/**
 * Ticket Filter
 * 
 * Ticket-specific filters extending BaseFilter.
 * Following Filter Pattern from guides.
 */

import { BaseFilter } from './BaseFilter';
import { TicketStatus } from '@core/domain/types';

export class TicketFilter extends BaseFilter {
  constructor(
    // Ticket-specific filters
    public status?: TicketStatus,
    public templateId?: string,
    public tags?: string[],
    public dateFrom?: Date,
    public dateTo?: Date,
    // BaseFilter properties
    search?: string,
    page?: number,
    pageSize?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    super(search, page, pageSize, sortBy, sortOrder);
  }

  /**
   * Check if status filter is applied
   */
  hasStatusFilter(): boolean {
    return this.status !== undefined;
  }

  /**
   * Check if template filter is applied
   */
  hasTemplateFilter(): boolean {
    return this.templateId !== undefined && this.templateId.trim() !== '';
  }

  /**
   * Check if tags filter is applied
   */
  hasTagsFilter(): boolean {
    return this.tags !== undefined && this.tags.length > 0;
  }

  /**
   * Check if date range filter is applied
   */
  hasDateRangeFilter(): boolean {
    return this.dateFrom !== undefined || this.dateTo !== undefined;
  }

  /**
   * Check if any filter is applied (excluding pagination/sorting)
   */
  hasAnyFilter(): boolean {
    return (
      this.hasSearch() ||
      this.hasStatusFilter() ||
      this.hasTemplateFilter() ||
      this.hasTagsFilter() ||
      this.hasDateRangeFilter()
    );
  }
}

