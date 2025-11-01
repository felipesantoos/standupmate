/**
 * Template Zod Schemas
 * 
 * Declarative validation for templates.
 * Following Colabora pattern for Zod schemas.
 */

import { z } from 'zod';
import { sectionSchema } from './section.schema';

/**
 * Template Schema
 * 
 * Validates complete template structure
 */
export const templateSchema = z.object({
  name: z.string()
    .min(3, 'Name must have at least 3 characters')
    .max(200, 'Name too long'),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be x.y.z format (e.g., 1.0.0)'),
  sections: z.array(sectionSchema).min(1, 'At least one section required'),
});

/**
 * Template Create/Update Schema
 * 
 * For forms (without ID and timestamps)
 */
export const templateFormSchema = templateSchema;

export type TemplateFormData = z.infer<typeof templateFormSchema>;

/**
 * Template Basic Info Schema
 * 
 * For basic template info only (name, description, version)
 */
export const templateBasicInfoSchema = z.object({
  name: z.string()
    .min(3, 'Name must have at least 3 characters')
    .max(200, 'Name too long'),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be x.y.z'),
});

export type TemplateBasicInfoFormData = z.infer<typeof templateBasicInfoSchema>;

