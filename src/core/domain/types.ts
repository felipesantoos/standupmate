/**
 * Core Domain Types
 * Pure TypeScript types and enums with no framework dependencies
 */

export enum TicketStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  DATE = 'date',
  NUMBER = 'number',
  MARKDOWN = 'markdown',
  CHECKLIST = 'checklist',
}

export interface TicketMetadata {
  dev: string;
  estimate?: string;
  actualTime?: string;
  priority?: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  order: number;
  validation?: FieldValidation;
  options?: FieldOption[];
  defaultValue?: any;
}

export interface Section {
  id: string;
  title: string;
  icon?: string;
  order: number;
  fields: Field[];
}

