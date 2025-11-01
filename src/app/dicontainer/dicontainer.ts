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
import { Database } from '@infra/database/sqlite';

/**
 * Dependency Injection Container Class
 * 
 * Manages service instantiation with lazy loading.
 */
class DIContainer {
  private db: Database | null = null;
  
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
   */
  get ticketService(): ITicketService {
    if (!this._ticketService) {
      const db = this.getDb();
      const ticketRepository = new SQLiteTicketRepository(db);
      
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
   */
  get templateService(): ITemplateService {
    if (!this._templateService) {
      const db = this.getDb();
      const templateRepository = new SQLiteTemplateRepository(db);
      const ticketRepository = new SQLiteTicketRepository(db);
      
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

