/**
 * Section Zod Schema
 * 
 * Declarative validation for template sections.
 */

import { z } from 'zod';
import { fieldSchema } from './field.schema';

/**
 * Section Schema
 * 
 * Validates template section structure
 */
export const sectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Section title is required'),
  order: z.number().int().min(0),
  fields: z.array(fieldSchema).min(1, 'Section must have at least one field'),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

