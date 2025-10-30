/**
 * Template Repository Interface (Secondary Port - Driven)
 * 
 * Defines template persistence contract.
 * Following Dependency Inversion Principle (DIP).
 */

import { Template } from '@core/domain/Template';

export interface ITemplateRepository {
  /**
   * Find all templates
   * 
   * @returns List of all templates
   */
  findAll(): Promise<Template[]>;

  /**
   * Find template by ID
   * 
   * @param id - Template ID
   * @returns Template if found, null otherwise
   */
  findById(id: string): Promise<Template | null>;

  /**
   * Find template by name
   * 
   * @param name - Template name
   * @returns Template if found, null otherwise
   */
  findByName(name: string): Promise<Template | null>;

  /**
   * Find default template
   * 
   * @returns Default template if exists, null otherwise
   */
  findDefault(): Promise<Template | null>;

  /**
   * Save (create or update) template
   * 
   * @param template - Template to save
   * @returns Saved template
   */
  save(template: Template): Promise<Template>;

  /**
   * Delete template
   * 
   * @param id - Template ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Set template as default
   * Unsets any other default template
   * 
   * @param id - Template ID
   * @returns Updated template
   */
  setAsDefault(id: string): Promise<Template>;

  /**
   * Check if template exists
   * 
   * @param id - Template ID
   * @returns true if exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count templates
   * 
   * @returns Total number of templates
   */
  count(): Promise<number>;

  /**
   * Find template by name and version
   * 
   * @param name - Template name
   * @param version - Template version
   * @returns Template if found, null otherwise
   */
  findByNameAndVersion(name: string, version: string): Promise<Template | null>;

  /**
   * Find all versions of a template by name
   * 
   * @param name - Template name
   * @returns List of all versions of the template
   */
  findVersionsByName(name: string): Promise<Template[]>;

  /**
   * Check if template has associated tickets
   * 
   * @param id - Template ID
   * @returns true if template has tickets, false otherwise
   */
  hasAssociatedTickets(id: string): Promise<boolean>;
}

