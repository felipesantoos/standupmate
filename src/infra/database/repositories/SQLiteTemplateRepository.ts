/**
 * SQLite Template Repository
 * 
 * Adapter that implements ITemplateRepository using SQLite.
 * Following Hexagonal Architecture.
 */

import { Template } from '@core/domain/Template';
import { ITemplateRepository } from '@core/interfaces/secondary/ITemplateRepository';
import { Database } from '../sqlite';
import { TemplateMapper, TemplateRow } from '../mappers/TemplateMapper';
import { DuplicateException } from '@core/exceptions/DomainExceptions';

export class SQLiteTemplateRepository implements ITemplateRepository {
  /**
   * Constructor injection
   * 
   * @param db - Database instance
   */
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Template[]> {
    const sql = 'SELECT * FROM templates ORDER BY created_at DESC';
    const rows = await this.db.query<TemplateRow>(sql);

    return TemplateMapper.toDomainList(rows);
  }

  async findById(id: string): Promise<Template | null> {
    const sql = 'SELECT * FROM templates WHERE id = ?';
    const row = await this.db.queryOne<TemplateRow>(sql, [id]);

    return row ? TemplateMapper.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Template | null> {
    const sql = 'SELECT * FROM templates WHERE name = ?';
    const row = await this.db.queryOne<TemplateRow>(sql, [name]);

    return row ? TemplateMapper.toDomain(row) : null;
  }

  async findDefault(): Promise<Template | null> {
    const sql = 'SELECT * FROM templates WHERE is_default = 1 LIMIT 1';
    const row = await this.db.queryOne<TemplateRow>(sql);

    return row ? TemplateMapper.toDomain(row) : null;
  }

  async save(template: Template): Promise<Template> {
    const row = TemplateMapper.fromDomain(template);

    try {
      // Check if template exists
      const exists = await this.exists(template.id);

      if (exists) {
        // Update existing template
        const sql = `
          UPDATE templates
          SET name = ?,
              description = ?,
              version = ?,
              is_default = ?,
              author = ?,
              updated_at = ?,
              sections_json = ?
          WHERE id = ?
        `;

        await this.db.execute(sql, [
          row.name,
          row.description,
          row.version,
          row.is_default,
          row.author,
          row.updated_at,
          row.sections_json,
          row.id,
        ]);
      } else {
        // Insert new template
        const sql = `
          INSERT INTO templates (
            id, name, description, version, is_default,
            author, created_at, updated_at, sections_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await this.db.execute(sql, [
          row.id,
          row.name,
          row.description,
          row.version,
          row.is_default,
          row.author,
          row.created_at,
          row.updated_at,
          row.sections_json,
        ]);
      }

      // Return saved template
      const saved = await this.findById(template.id);
      return saved!;
    } catch (error: any) {
      // Transform database errors into domain exceptions
      if (error?.message?.includes('UNIQUE constraint failed: templates.name, templates.version')) {
        throw new DuplicateException(
          'Template',
          'name and version',
          `${template.name} v${template.version}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM templates WHERE id = ?';
    const result = await this.db.execute(sql, [id]);

    return (result.changes ?? 0) > 0;
  }

  async setAsDefault(id: string): Promise<Template> {
    // First, unset all other defaults
    await this.db.execute('UPDATE templates SET is_default = 0 WHERE is_default = 1');

    // Then set this template as default
    await this.db.execute('UPDATE templates SET is_default = 1 WHERE id = ?', [id]);

    // Return updated template
    const template = await this.findById(id);
    return template!;
  }

  async exists(id: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM templates WHERE id = ? LIMIT 1';
    const result = await this.db.queryOne(sql, [id]);

    return result !== null && result !== undefined;
  }

  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM templates';
    const result = await this.db.queryOne<{ total: number }>(sql);

    return result?.total || 0;
  }

  async findByNameAndVersion(name: string, version: string): Promise<Template | null> {
    const sql = 'SELECT * FROM templates WHERE name = ? AND version = ?';
    const row = await this.db.queryOne<TemplateRow>(sql, [name, version]);

    return row ? TemplateMapper.toDomain(row) : null;
  }

  async findVersionsByName(name: string): Promise<Template[]> {
    const sql = 'SELECT * FROM templates WHERE name = ? ORDER BY version DESC';
    const rows = await this.db.query<TemplateRow>(sql, [name]);

    return TemplateMapper.toDomainList(rows);
  }

  async hasAssociatedTickets(id: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as total FROM tickets WHERE template_id = ?';
    const result = await this.db.queryOne<{ total: number }>(sql, [id]);

    return (result?.total || 0) > 0;
  }
}

