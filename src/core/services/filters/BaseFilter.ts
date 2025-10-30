/**
 * Base Filter
 * 
 * Common filtering, pagination, and sorting for all entities.
 * Following DRY principle - all entity filters extend this.
 * 
 * Pattern from guides: Filter Pattern
 */

export class BaseFilter {
  constructor(
    public search?: string,
    public page?: number,
    public pageSize?: number,
    public sortBy?: string,
    public sortOrder?: 'asc' | 'desc'
  ) {
    // Set defaults
    this.page = page || 1;
    this.pageSize = pageSize || 20;
    this.sortOrder = sortOrder || 'desc';
  }

  /**
   * Calculate offset for SQL OFFSET clause
   */
  getOffset(): number {
    return ((this.page || 1) - 1) * (this.pageSize || 20);
  }

  /**
   * Get limit for SQL LIMIT clause
   */
  getLimit(): number {
    return this.pageSize || 20;
  }

  /**
   * Check if pagination is enabled
   */
  hasPagination(): boolean {
    return this.page !== undefined && this.page > 0;
  }

  /**
   * Check if sorting is enabled
   */
  hasSorting(): boolean {
    return this.sortBy !== undefined && this.sortBy.trim() !== '';
  }

  /**
   * Check if search is enabled
   */
  hasSearch(): boolean {
    return this.search !== undefined && this.search.trim() !== '';
  }
}

