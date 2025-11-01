/**
 * Ticket Zod Schema Factory
 * 
 * Creates dynamic schemas based on template fields.
 * Following Colabora pattern for dynamic validation.
 */

import { z } from 'zod';
import { Template } from '@core/domain/Template';
import { FieldType } from '@core/domain/types';

/**
 * Creates a dynamic Zod schema based on template fields
 * 
 * @param template - Template to create schema from
 * @returns Zod schema for ticket data validation
 */
export function createTicketSchema(template: Template) {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  template.sections.forEach(section => {
    section.fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
        case FieldType.MARKDOWN:
          let stringSchema = z.string();
          
          // Apply string validations
          if (field.validation?.minLength) {
            stringSchema = stringSchema.min(
              field.validation.minLength,
              `Minimum ${field.validation.minLength} characters required`
            );
          }
          if (field.validation?.maxLength) {
            stringSchema = stringSchema.max(
              field.validation.maxLength,
              `Maximum ${field.validation.maxLength} characters allowed`
            );
          }
          if (field.validation?.pattern) {
            stringSchema = stringSchema.regex(
              new RegExp(field.validation.pattern),
              field.validation.message || 'Invalid format'
            );
          }
          fieldSchema = stringSchema;
          break;
          
        case FieldType.NUMBER:
          let numberSchema = z.coerce.number({
            invalid_type_error: 'Must be a number',
          });
          
          // Apply number validations
          if (field.validation?.min !== undefined) {
            numberSchema = numberSchema.min(
              field.validation.min,
              `Minimum value is ${field.validation.min}`
            );
          }
          if (field.validation?.max !== undefined) {
            numberSchema = numberSchema.max(
              field.validation.max,
              `Maximum value is ${field.validation.max}`
            );
          }
          fieldSchema = numberSchema;
          break;
          
        case FieldType.DATE:
          // Date as string in YYYY-MM-DD format
          fieldSchema = z.string().regex(
            /^\d{4}-\d{2}-\d{2}$/,
            'Date must be in YYYY-MM-DD format'
          );
          break;
          
        case FieldType.SELECT:
        case FieldType.RADIO:
          // Enum from options
          if (field.options && field.options.length > 0) {
            const options = field.options as string[];
            fieldSchema = z.enum(options as [string, ...string[]]);
          } else {
            fieldSchema = z.string();
          }
          break;
          
        case FieldType.CHECKBOX:
          fieldSchema = z.boolean();
          break;
          
        default:
          // Fallback to any
          fieldSchema = z.any();
      }
      
      // Handle required/optional
      if (!field.required) {
        // Optional fields can be undefined, null, or empty string
        fieldSchema = fieldSchema.optional().or(z.literal('')).or(z.null());
      }
      
      shape[field.id] = fieldSchema;
    });
  });
  
  return z.object(shape);
}

/**
 * Ticket metadata schema
 * 
 * Validates ticket metadata (dev, priority, etc)
 */
export const ticketMetadataSchema = z.object({
  dev: z.string().min(1, 'Developer name is required'),
  priority: z.string().optional(),
  blocker: z.string().optional(),
});

/**
 * Complete ticket schema (for forms with metadata)
 * 
 * Combines data (dynamic) and metadata (static)
 */
export function createCompleteTicketSchema(template: Template) {
  const dataSchema = createTicketSchema(template);
  
  return z.object({
    data: dataSchema,
    metadata: ticketMetadataSchema,
    tags: z.array(z.string()).optional(),
  });
}

export type TicketFormData = Record<string, any>;
export type TicketMetadataFormData = z.infer<typeof ticketMetadataSchema>;

