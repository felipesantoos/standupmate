/**
 * Template Service Interface (Primary Port - Driver)
 * 
 * Defines template business operations contract.
 * Following Interface Segregation Principle (ISP).
 */

import { Template } from '@core/domain/Template';
import { Section, Field } from '@core/domain/types';

export interface ITemplateService {
  /**
   * List all templates
   * 
   * @returns List of all templates
   */
  listTemplates(): Promise<Template[]>;

  /**
   * Get template by ID
   * 
   * @param id - Template ID
   * @returns Template
   * @throws TemplateNotFoundException if not found
   */
  getTemplate(id: string): Promise<Template>;

  /**
   * Get default template
   * 
   * @returns Default template
   * @throws TemplateNotFoundException if no default template
   */
  getDefaultTemplate(): Promise<Template>;

  /**
   * Create new template
   * 
   * Enforces business validation.
   * 
   * @param template - Template to create
   * @returns Created template
   * @throws ValidationException if validation fails
   * @throws DuplicateException if name already exists
   */
  createTemplate(template: Template): Promise<Template>;

  /**
   * Update existing template
   * 
   * @param id - Template ID
   * @param template - Updated template data
   * @returns Updated template
   * @throws TemplateNotFoundException if not found
   * @throws ValidationException if validation fails
   */
  updateTemplate(id: string, template: Template): Promise<Template>;

  /**
   * Delete template
   * 
   * Cannot delete if tickets are using it.
   * 
   * @param id - Template ID
   * @returns true if deleted
   * @throws TemplateNotFoundException if not found
   * @throws InvalidOperationException if template is in use
   */
  deleteTemplate(id: string): Promise<boolean>;

  /**
   * Duplicate template
   * 
   * @param id - Template ID to duplicate
   * @param newName - Name for duplicated template
   * @returns Duplicated template
   * @throws TemplateNotFoundException if not found
   */
  duplicateTemplate(id: string, newName: string): Promise<Template>;

  /**
   * Set template as default
   * 
   * @param id - Template ID
   * @returns Updated template
   */
  setAsDefault(id: string): Promise<Template>;

  /**
   * Import template from JSON
   * 
   * @param json - JSON string representation
   * @returns Imported template
   * @throws ValidationException if JSON is invalid
   */
  importFromJSON(json: string): Promise<Template>;

  /**
   * Export template to JSON
   * 
   * @param id - Template ID
   * @returns JSON string representation
   * @throws TemplateNotFoundException if not found
   */
  exportToJSON(id: string): Promise<string>;

  /**
   * Create new version of template
   * 
   * Increments major version and creates a new template instance
   * with the same name but different version.
   * 
   * @param id - Template ID to create new version from
   * @returns New template with incremented version
   * @throws TemplateNotFoundException if not found
   */
  createNewVersion(id: string): Promise<Template>;

  /**
   * Check if template can be edited
   * 
   * Templates with associated tickets cannot be edited.
   * 
   * @param id - Template ID
   * @returns true if template can be edited (no tickets), false otherwise
   * @throws TemplateNotFoundException if not found
   */
  canEditTemplate(id: string): Promise<boolean>;

  /**
   * Get all versions of a template by name
   * 
   * @param name - Template name
   * @returns List of all versions sorted by version (descending)
   */
  getTemplateVersions(name: string): Promise<Template[]>;
}

