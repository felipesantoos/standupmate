/**
 * Dependency Injection Container
 * 
 * Singleton that manages services and repositories.
 * Following Hexagonal Architecture pattern from Colabora guides.
 * 
 * All services are lazy-initialized (created only when first accessed).
 * Database must be initialized before using this container (in main.tsx).
 */

import { TicketService } from '@core/services/TicketService';
import { TemplateService } from '@core/services/TemplateService';
import { ExportService } from '@core/services/ExportService';
import { AnalyticsService } from '@core/services/AnalyticsService';
import { ITicketService } from '@core/interfaces/primary/ITicketService';
import { ITemplateService } from '@core/interfaces/primary/ITemplateService';
import { IExportService } from '@core/interfaces/primary/IExportService';
import { SQLiteTicketRepository } from '@infra/database/repositories/SQLiteTicketRepository';
import { SQLiteTemplateRepository } from '@infra/database/repositories/SQLiteTemplateRepository';
import { TicketAPIRepository } from '@infra/api/repositories/TicketAPIRepository';
import { TemplateAPIRepository } from '@infra/api/repositories/TemplateAPIRepository';
import { Database } from '@infra/database/sqlite';
import { env } from '@/config/env';

/**
 * Dependency Injection Container Class
 * 
 * Manages service instantiation with lazy loading.
 */
class DIContainer {
  private db: Database | null = null;
  private useAPI: boolean = env.useAPI; // Toggle: false = SQLite, true = HTTP API
  
  // Service instances (lazy-initialized)
  private _ticketService?: ITicketService;
  private _templateService?: ITemplateService;
  private _exportService?: IExportService;
  private _analyticsService?: AnalyticsService;

  /**
   * Set database instance (must be called during app initialization)
   * 
   * @param database - Initialized database instance
   */
  setDatabase(database: Database): void {
    this.db = database;
    // Reset services when database changes
    this._ticketService = undefined;
    this._templateService = undefined;
  }

  /**
   * Set whether to use HTTP API or SQLite
   * 
   * @param use - true for HTTP API, false for SQLite
   */
  setUseAPI(use: boolean): void {
    this.useAPI = use;
    // Reset services to recreate with new repository type
    this.reset();
  }

  /**
   * Get database instance
   * 
   * @throws Error if database not initialized
   */
  private getDb(): Database {
    if (!this.db) {
      throw new Error(
        'Database not initialized. Call diContainer.setDatabase() in main.tsx before using services.'
      );
    }
    return this.db;
  }

  /**
   * Get TicketService instance
   * 
   * Lazy-initialized on first access.
   * Dependencies: TicketRepository, TemplateService
   * 
   * Uses SQLite or HTTP API based on useAPI flag
   */
  get ticketService(): ITicketService {
    if (!this._ticketService) {
      // Choose repository based on useAPI flag
      const ticketRepository = this.useAPI
        ? new TicketAPIRepository()           // HTTP API (future backend)
        : new SQLiteTicketRepository(this.getDb()); // SQLite local (current)
      
      // TicketService depends on TemplateService for validation
      const templateService = this.templateService;
      
      this._ticketService = new TicketService(ticketRepository, templateService);
    }
    return this._ticketService;
  }

  /**
   * Get TemplateService instance
   * 
   * Lazy-initialized on first access.
   * Dependencies: TemplateRepository, TicketRepository
   * 
   * Uses SQLite or HTTP API based on useAPI flag
   */
  get templateService(): ITemplateService {
    if (!this._templateService) {
      // Choose repository based on useAPI flag
      const templateRepository = this.useAPI
        ? new TemplateAPIRepository()             // HTTP API (future backend)
        : new SQLiteTemplateRepository(this.getDb()); // SQLite local (current)
      
      const ticketRepository = this.useAPI
        ? new TicketAPIRepository()
        : new SQLiteTicketRepository(this.getDb());
      
      this._templateService = new TemplateService(templateRepository, ticketRepository);
    }
    return this._templateService;
  }

  /**
   * Get ExportService instance
   * 
   * Lazy-initialized on first access.
   * No dependencies.
   */
  get exportService(): IExportService {
    if (!this._exportService) {
      this._exportService = new ExportService();
    }
    return this._exportService;
  }

  /**
   * Get AnalyticsService instance
   * 
   * Lazy-initialized on first access.
   * No dependencies.
   */
  get analyticsService(): AnalyticsService {
    if (!this._analyticsService) {
      this._analyticsService = new AnalyticsService();
    }
    return this._analyticsService;
  }

  /**
   * Reset all service instances (useful for testing)
   * 
   * Forces services to be recreated on next access.
   * Use with caution - should only be called in tests.
   */
  reset(): void {
    this._ticketService = undefined;
    this._templateService = undefined;
    this._exportService = undefined;
    this._analyticsService = undefined;
    this.db = null;
  }
}

/**
 * Singleton DI Container instance
 * 
 * Import this in Contexts and Components to access services.
 * 
 * Example usage:
 * ```typescript
 * import { diContainer } from '@app/dicontainer/dicontainer';
 * 
 * const TicketProvider = ({ children }) => {
 *   const service = diContainer.ticketService;
 *   // ...
 * };
 * ```
 */
export const diContainer = new DIContainer();

