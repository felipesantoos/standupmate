/**
 * Ticket API Response DTOs
 * 
 * Response structures from backend API for tickets.
 * Following Colabora pattern - snake_case for API, camelCase in domain.
 */

/**
 * Ticket Response DTO
 * 
 * Represents ticket data as returned by API
 */
export interface TicketResponse {
  id: string;
  template_id: string;
  template_version: string;
  status: string;
  data: Record<string, any>;
  metadata: {
    dev: string;
    priority?: string;
    blocker?: string;
  };
  tags: string[];
  created_at: string; // ISO date string
  updated_at: string;
  completed_at?: string;
}

/**
 * Ticket List Response (with pagination)
 */
export interface TicketListResponse {
  items: TicketResponse[];
  total: number;
  page: number;
  page_size: number;
}

