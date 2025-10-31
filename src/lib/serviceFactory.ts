/**
 * Service Factory
 * 
 * Factory Pattern for creating services with dependencies.
 * Following Dependency Injection pattern from guides.
 */

import { TicketService } from '@core/services/TicketService';
import { TemplateService } from '@core/services/TemplateService';
import { ExportService } from '@core/services/ExportService';
import { ITicketService } from '@core/interfaces/primary/ITicketService';
import { ITemplateService } from '@core/interfaces/primary/ITemplateService';
import { IExportService } from '@core/interfaces/primary/IExportService';
import { SQLiteTicketRepository } from '@infra/database/repositories/SQLiteTicketRepository';
import { SQLiteTemplateRepository } from '@infra/database/repositories/SQLiteTemplateRepository';
import { getDatabase } from '@infra/database/sqlite';
import { runSeeds } from '@infra/database/seed';

/**
 * Singleton instances (avoid recreating services)
 */
let ticketServiceInstance: ITicketService | null = null;
let templateServiceInstance: ITemplateService | null = null;
let exportServiceInstance: IExportService | null = null;

/**
 * Track if database has been initialized
 */
let databaseInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize database and run seeds if needed (with lock to prevent race conditions)
 */
async function initializeDatabase(): Promise<void> {
  // If already initialized, skip
  if (databaseInitialized) {
    return;
  }

  // If currently initializing (race condition), wait for it to finish
  if (initializationPromise) {
    console.log('⏳ Database initialization already in progress, waiting...');
    await initializationPromise;
    return;
  }

  // Create the initialization promise and execute
  initializationPromise = (async () => {
    const db = await getDatabase();
    
    // Run seeds on first initialization only
    try {
      await runSeeds(db);
      databaseInitialized = true;
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('Failed to run seeds:', error);
      // Don't set databaseInitialized to allow retry
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  await initializationPromise;
}

/**
 * Create or get TicketService instance
 * 
 * Factory pattern: Creates service with all dependencies injected.
 */
export async function createTicketService(): Promise<ITicketService> {
  if (ticketServiceInstance) {
    return ticketServiceInstance;
  }

  await initializeDatabase();
  const db = await getDatabase();
  const repository = new SQLiteTicketRepository(db);
  
  // Get template service for validations
  const templateService = await createTemplateService();
  
  ticketServiceInstance = new TicketService(repository, templateService);
  return ticketServiceInstance;
}

/**
 * Create or get TemplateService instance
 */
export async function createTemplateService(): Promise<ITemplateService> {
  if (templateServiceInstance) {
    return templateServiceInstance;
  }

  const db = await getDatabase();
  const templateRepository = new SQLiteTemplateRepository(db);
  const ticketRepository = new SQLiteTicketRepository(db);
  
  templateServiceInstance = new TemplateService(templateRepository, ticketRepository);
  return templateServiceInstance;
}

/**
 * Create or get ExportService instance
 */
export async function createExportService(): Promise<IExportService> {
  if (exportServiceInstance) {
    return exportServiceInstance;
  }

  exportServiceInstance = new ExportService();
  return exportServiceInstance;
}

/**
 * Reset service instances (useful for testing)
 */
export function resetServiceInstances(): void {
  ticketServiceInstance = null;
  templateServiceInstance = null;
  exportServiceInstance = null;
  databaseInitialized = false;
  initializationPromise = null;
}

