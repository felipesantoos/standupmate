/**
 * Field Zod Schemas
 * 
 * Declarative validation for template fields.
 * Following Colabora pattern for Zod schemas.
 */

import { z } from 'zod';
import { FieldType } from '@core/domain/types';

/**
 * Field Validation Schema
 * 
 * Validates field validation rules
 */
export const fieldValidationSchema = z.object({
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  minItems: z.number().int().positive().optional(),
  maxItems: z.number().int().positive().optional(),
}).optional();

/**
 * Field Schema
 * 
 * Validates template field structure
 */
export const fieldSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Field label is required'),
  type: z.nativeEnum(FieldType),
  required: z.boolean(),
  placeholder: z.string().optional(),
  order: z.number().int().min(0),
  validation: fieldValidationSchema,
  options: z.array(z.string()).optional(),
  defaultValue: z.any().optional(),
}).refine((data) => {
  // Se for SELECT ou RADIO, deve ter options
  if ([FieldType.SELECT, FieldType.RADIO].includes(data.type)) {
    return data.options && data.options.length > 0;
  }
  return true;
}, {
  message: 'SELECT and RADIO fields must have options',
  path: ['options'],
});

export type FieldFormData = z.infer<typeof fieldSchema>;

