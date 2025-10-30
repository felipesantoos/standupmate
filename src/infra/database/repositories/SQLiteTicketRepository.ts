/**
 * SQLite Ticket Repository
 * 
 * Adapter that implements ITicketRepository using SQLite.
 * Following Hexagonal Architecture - this is a secondary adapter.
 * Domain doesn't depend on this, only on the interface.
 */

import { Ticket } from '@core/domain/Ticket';
import { ITicketRepository } from '@core/interfaces/secondary/ITicketRepository';
import { TicketFilter } from '@core/services/filters/TicketFilter';
import { TicketStatus } from '@core/domain/types';
import { Database } from '../sqlite';
import { TicketMapper, TicketRow } from '../mappers/TicketMapper';
import { TemplateNotFoundException } from '@core/exceptions/DomainExceptions';

export class SQLiteTicketRepository implements ITicketRepository {
  /**
   * Constructor injection
   * 
   * @param db - Database instance
   */
  constructor(private readonly db: Database) {}

  async findAll(filter?: TicketFilter): Promise<Ticket[]> {
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];

    if (filter) {
      // Apply search filter (simple LIKE search on data_json)
      if (filter.hasSearch()) {
        sql += ' AND data_json LIKE ?';
        params.push(`%${filter.search}%`);
      }

      // Apply status filter
      if (filter.hasStatusFilter()) {
        sql += ' AND status = ?';
        params.push(filter.status);
      }

      // Apply template filter
      if (filter.hasTemplateFilter()) {
        sql += ' AND template_id = ?';
        params.push(filter.templateId);
      }

      // Apply tags filter (at least one tag matches)
      if (filter.hasTagsFilter()) {
        // Use JSON functions to check if any tag matches
        const tagConditions = filter.tags!.map(() => 'tags_json LIKE ?').join(' OR ');
        sql += ` AND (${tagConditions})`;
        filter.tags!.forEach(tag => {
          params.push(`%"${tag}"%`);
        });
      }

      // Apply date range filter
      if (filter.hasDateRangeFilter()) {
        if (filter.dateFrom) {
          sql += ' AND created_at >= ?';
          params.push(filter.dateFrom.toISOString());
        }
        if (filter.dateTo) {
          sql += ' AND created_at <= ?';
          params.push(filter.dateTo.toISOString());
        }
      }

      // Apply sorting
      if (filter.hasSorting()) {
        sql += ` ORDER BY ${filter.sortBy} ${filter.sortOrder}`;
      } else {
        sql += ' ORDER BY created_at DESC'; // Default sorting
      }

      // Apply pagination
      if (filter.hasPagination()) {
        sql += ' LIMIT ? OFFSET ?';
        params.push(filter.getLimit(), filter.getOffset());
      }
    } else {
      // No filter - default sorting
      sql += ' ORDER BY created_at DESC';
    }

    const rows = await this.db.query<TicketRow>(sql, params);
    return TicketMapper.toDomainList(rows);
  }

  async findById(id: string): Promise<Ticket | null> {
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    const row = await this.db.queryOne<TicketRow>(sql, [id]);

    return row ? TicketMapper.toDomain(row) : null;
  }

  async findByStatus(status: TicketStatus): Promise<Ticket[]> {
    const sql = 'SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC';
    const rows = await this.db.query<TicketRow>(sql, [status]);

    return TicketMapper.toDomainList(rows);
  }

  async findByTemplateId(templateId: string): Promise<Ticket[]> {
    const sql = 'SELECT * FROM tickets WHERE template_id = ? ORDER BY created_at DESC';
    const rows = await this.db.query<TicketRow>(sql, [templateId]);

    return TicketMapper.toDomainList(rows);
  }

  async findByTag(tag: string): Promise<Ticket[]> {
    const sql = 'SELECT * FROM tickets WHERE tags_json LIKE ? ORDER BY created_at DESC';
    const rows = await this.db.query<TicketRow>(sql, [`%"${tag}"%`]);

    return TicketMapper.toDomainList(rows);
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const row = TicketMapper.fromDomain(ticket);

    try {
      // Check if ticket exists
      const exists = await this.exists(ticket.id);

      if (exists) {
        // Update existing ticket
        const sql = `
          UPDATE tickets
          SET template_id = ?,
              template_version = ?,
              status = ?,
              data_json = ?,
              metadata_json = ?,
              tags_json = ?,
              updated_at = ?,
              completed_at = ?
          WHERE id = ?
        `;

        await this.db.execute(sql, [
          row.template_id,
          row.template_version,
          row.status,
          row.data_json,
          row.metadata_json,
          row.tags_json,
          row.updated_at,
          row.completed_at,
          row.id,
        ]);
      } else {
        // Insert new ticket
        const sql = `
          INSERT INTO tickets (
            id, template_id, template_version, status,
            data_json, metadata_json, tags_json,
            created_at, updated_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await this.db.execute(sql, [
          row.id,
          row.template_id,
          row.template_version,
          row.status,
          row.data_json,
          row.metadata_json,
          row.tags_json,
          row.created_at,
          row.updated_at,
          row.completed_at,
        ]);
      }

      // Return saved ticket
      const saved = await this.findById(ticket.id);
      return saved!;
    } catch (error: any) {
      // Transform database errors into domain exceptions
      if (error?.message?.includes('FOREIGN KEY constraint failed')) {
        throw new TemplateNotFoundException(ticket.templateId);
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM tickets WHERE id = ?';
    const result = await this.db.execute(sql, [id]);

    return (result.changes ?? 0) > 0;
  }

  async count(filter?: TicketFilter): Promise<number> {
    let sql = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
    const params: any[] = [];

    if (filter) {
      // Same filters as findAll, but NO pagination/sorting

      if (filter.hasSearch()) {
        sql += ' AND data_json LIKE ?';
        params.push(`%${filter.search}%`);
      }

      if (filter.hasStatusFilter()) {
        sql += ' AND status = ?';
        params.push(filter.status);
      }

      if (filter.hasTemplateFilter()) {
        sql += ' AND template_id = ?';
        params.push(filter.templateId);
      }

      if (filter.hasTagsFilter()) {
        const tagConditions = filter.tags!.map(() => 'tags_json LIKE ?').join(' OR ');
        sql += ` AND (${tagConditions})`;
        filter.tags!.forEach(tag => {
          params.push(`%"${tag}"%`);
        });
      }

      if (filter.hasDateRangeFilter()) {
        if (filter.dateFrom) {
          sql += ' AND created_at >= ?';
          params.push(filter.dateFrom.toISOString());
        }
        if (filter.dateTo) {
          sql += ' AND created_at <= ?';
          params.push(filter.dateTo.toISOString());
        }
      }
    }

    const result = await this.db.queryOne<{ total: number }>(sql, params);
    return result?.total || 0;
  }

  async exists(id: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM tickets WHERE id = ? LIMIT 1';
    const result = await this.db.queryOne(sql, [id]);

    return result !== null && result !== undefined;
  }
}

