/**
 * Common API Response DTOs
 * 
 * Shared response structures for API communication.
 * Following Colabora pattern for API DTOs.
 */

/**
 * Paginated Response DTO
 * 
 * Standard structure for paginated API responses
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/**
 * API Error Response
 * 
 * Standard error response structure
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

