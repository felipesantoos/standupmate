/**
 * Ticket API Request DTOs
 * 
 * Request structures sent to backend API for tickets.
 * Following REST API conventions - snake_case for API.
 */

/**
 * Create Ticket Request DTO
 * 
 * Data required to create a new ticket
 */
export interface CreateTicketRequest {
  template_id: string;
  template_version: string;
  status: string;
  data: Record<string, any>;
  metadata: {
    dev: string;
    priority?: string;
    blocker?: string;
  };
  tags?: string[];
}

/**
 * Update Ticket Request DTO
 * 
 * Data for updating an existing ticket (partial)
 */
export interface UpdateTicketRequest {
  status?: string;
  data?: Record<string, any>;
  metadata?: {
    dev?: string;
    priority?: string;
    blocker?: string;
  };
  tags?: string[];
}

/**
 * Update Ticket Status Request DTO
 */
export interface UpdateTicketStatusRequest {
  status: string;
}

