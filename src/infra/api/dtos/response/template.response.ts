/**
 * Template API Response DTOs
 * 
 * Response structures from backend API for templates.
 */

/**
 * Template Response DTO
 * 
 * Represents template data as returned by API
 */
export interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  version: string;
  is_default: boolean;
  author?: string;
  sections: SectionResponse[];
  created_at: string;
  updated_at: string;
}

/**
 * Section Response DTO
 */
export interface SectionResponse {
  id: string;
  title: string;
  order: number;
  fields: FieldResponse[];
}

/**
 * Field Response DTO
 */
export interface FieldResponse {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  order: number;
  validation?: {
    min_length?: number;
    max_length?: number;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    min_items?: number;
    max_items?: number;
  };
  options?: string[];
  default_value?: any;
}

