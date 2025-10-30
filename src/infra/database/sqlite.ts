/**
 * SQLite Database Implementation
 * 
 * Real implementation using sql.js for browser-based SQLite.
 * Data persisted in localStorage.
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

/**
 * Database interface abstraction
 */
export interface Database {
  select<T = any>(sql: string, params?: any[]): Promise<T[]>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ rowsAffected: number; lastInsertId?: number; changes?: number }>;
  close(): Promise<void>;
}

/**
 * SQLite implementation using sql.js
 */
class SQLiteDatabase implements Database {
  private db: SqlJsDatabase | null = null;
  private initialized = false;
  private readonly DB_KEY = 'ticketTracker.db';

  /**
   * Initialize database and load schema
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        // Load from CDN (will be cached by browser)
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Try to load existing database from localStorage
      const savedData = localStorage.getItem(this.DB_KEY);
      
      if (savedData) {
        // Load existing database
        const buffer = this.base64ToUint8Array(savedData);
        this.db = new SQL.Database(buffer);
        console.log('📂 Database loaded from localStorage');
      } else {
        // Create new database
        this.db = new SQL.Database();
        console.log('✨ New database created');
      }

      // Run migrations/schema
      await this.initializeSchema();
      
      // Save to localStorage
      this.save();
      
      this.initialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const schema = `
      -- Templates table
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        version TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        author TEXT,
        sections_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Tickets table
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        template_version TEXT NOT NULL,
        status TEXT NOT NULL,
        data_json TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (template_id) REFERENCES templates(id)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_templates_is_default ON templates(is_default);
      CREATE INDEX IF NOT EXISTS idx_tickets_template_id ON tickets(template_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

      -- Note: FTS5 (Full-Text Search) is not available in standard sql.js
      -- We'll use LIKE queries for search functionality instead
    `;

    try {
      this.db.run(schema);
      console.log('✅ Schema initialized');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error);
      throw error;
    }
  }

  /**
   * Execute SELECT query
   */
  async select<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const stmt = this.db!.prepare(sql);
      stmt.bind(params);
      
      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('❌ SELECT query failed:', sql, params, error);
      throw error;
    }
  }

  /**
   * Execute query (alias for select)
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.select<T>(sql, params);
  }

  /**
   * Execute query and return first result
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.select<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute INSERT/UPDATE/DELETE query
   */
  async execute(sql: string, params: any[] = []): Promise<{ rowsAffected: number; lastInsertId?: number }> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      this.db!.run(sql, params);
      
      // Get affected rows and last insert ID
      const changes = this.db!.getRowsModified();
      
      // Try to get last insert ID (only works for INSERT)
      let lastInsertId: number | undefined;
      try {
        const result = this.db!.exec('SELECT last_insert_rowid() as id');
        if (result.length > 0 && result[0].values.length > 0) {
          lastInsertId = result[0].values[0][0] as number;
        }
      } catch {
        // Ignore errors getting last insert ID
      }

      // Save to localStorage after modification
      this.save();

      return {
        rowsAffected: changes,
        lastInsertId,
        changes, // Some code uses 'changes' directly
      };
    } catch (error) {
      console.error('❌ EXECUTE query failed:', sql, params, error);
      throw error;
    }
  }

  /**
   * Save database to localStorage
   */
  private save(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const base64 = this.uint8ArrayToBase64(data);
      localStorage.setItem(this.DB_KEY, base64);
    } catch (error) {
      console.error('❌ Failed to save database:', error);
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * Convert Uint8Array to base64 string
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clear(): Promise<void> {
    localStorage.removeItem(this.DB_KEY);
    await this.close();
    await this.initialize();
  }
}

/**
 * Singleton instance
 */
let dbInstance: SQLiteDatabase | null = null;

/**
 * Get database instance (singleton)
 */
export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = new SQLiteDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Reset database (clear all data)
 */
export async function resetDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.clear();
  } else {
    dbInstance = new SQLiteDatabase();
    await dbInstance.clear();
  }
}
