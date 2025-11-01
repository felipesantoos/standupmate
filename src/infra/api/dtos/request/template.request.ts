/**
 * Template API Request DTOs
 * 
 * Request structures sent to backend API for templates.
 */

/**
 * Create Template Request DTO
 */
export interface CreateTemplateRequest {
  name: string;
  description: string;
  version: string;
  author?: string;
  sections: SectionRequest[];
}

/**
 * Update Template Request DTO (partial)
 */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  version?: string;
  sections?: SectionRequest[];
}

/**
 * Section Request DTO
 */
export interface SectionRequest {
  id: string;
  title: string;
  order: number;
  fields: FieldRequest[];
}

/**
 * Field Request DTO
 */
export interface FieldRequest {
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
    min_items?: number;
    max_items?: number;
  };
  options?: string[];
  default_value?: any;
}

