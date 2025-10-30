/**
 * Template Mapper
 * 
 * Converts between database models and domain models.
 * Following Mapper Pattern from guides.
 */

import { Template } from '@core/domain/Template';

/**
 * Database row structure
 */
export interface TemplateRow {
  id: string;
  name: string;
  description: string;
  version: string;
  is_default: number; // SQLite uses INTEGER for boolean
  author: string | null;
  created_at: string;
  updated_at: string;
  sections_json: string;
}

export class TemplateMapper {
  /**
   * Convert database row to domain model
   * 
   * @param row - Database row
   * @returns Domain model
   */
  static toDomain(row: TemplateRow): Template {
    return new Template(
      row.id,
      row.name,
      row.description,
      row.version,
      row.is_default === 1, // Convert INTEGER to boolean
      JSON.parse(row.sections_json),
      new Date(row.created_at),
      new Date(row.updated_at),
      row.author || undefined
    );
  }

  /**
   * Convert domain model to database row
   * 
   * @param template - Domain model
   * @returns Database row
   */
  static fromDomain(template: Template): TemplateRow {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      is_default: template.isDefault ? 1 : 0, // Convert boolean to INTEGER
      author: template.author || null,
      created_at: template.createdAt.toISOString(),
      updated_at: template.updatedAt.toISOString(),
      sections_json: JSON.stringify(template.sections),
    };
  }

  /**
   * Convert multiple rows to domain models
   * 
   * @param rows - Database rows
   * @returns Domain models
   */
  static toDomainList(rows: TemplateRow[]): Template[] {
    return rows.map(row => TemplateMapper.toDomain(row));
  }
}

