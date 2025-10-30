/**
 * Template Service Implementation
 * 
 * Orchestrates template business logic.
 * Following SOLID principles.
 */

import { Template } from '@core/domain/Template';
import { ITemplateService } from '@core/interfaces/primary/ITemplateService';
import { ITemplateRepository } from '@core/interfaces/secondary/ITemplateRepository';
import { ITicketRepository } from '@core/interfaces/secondary/ITicketRepository';
import {
  TemplateNotFoundException,
  DuplicateException,
  InvalidOperationException,
  ValidationException,
} from '@core/exceptions/DomainExceptions';

export class TemplateService implements ITemplateService {
  /**
   * Constructor injection.
   * Depends on INTERFACES (DIP).
   */
  constructor(
    private readonly templateRepository: ITemplateRepository,
    private readonly ticketRepository: ITicketRepository
  ) {}

  async listTemplates(): Promise<Template[]> {
    return await this.templateRepository.findAll();
  }

  async getTemplate(id: string): Promise<Template> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new TemplateNotFoundException(id);
    }

    return template;
  }

  async getDefaultTemplate(): Promise<Template> {
    const defaultTemplate = await this.templateRepository.findDefault();

    if (!defaultTemplate) {
      throw new TemplateNotFoundException('default');
    }

    return defaultTemplate;
  }

  async createTemplate(template: Template): Promise<Template> {
    // Business validation
    template.validate();

    // Check for duplicate name
    const existing = await this.templateRepository.findByName(template.name);
    if (existing) {
      throw new DuplicateException('Template', 'name', template.name);
    }

    // Save
    return await this.templateRepository.save(template);
  }

  async updateTemplate(id: string, template: Template): Promise<Template> {
    // Check if exists
    const existing = await this.templateRepository.findById(id);
    if (!existing) {
      throw new TemplateNotFoundException(id);
    }

    // Business validation
    template.validate();

    // Check for duplicate name (excluding current template)
    const duplicateName = await this.templateRepository.findByName(template.name);
    if (duplicateName && duplicateName.id !== id) {
      throw new DuplicateException('Template', 'name', template.name);
    }

    // Ensure ID is set
    template.id = id;
    template.updatedAt = new Date();

    return await this.templateRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    // Check if exists
    const existing = await this.templateRepository.findById(id);
    if (!existing) {
      throw new TemplateNotFoundException(id);
    }

    // Check if template is in use
    const ticketsUsingTemplate = await this.ticketRepository.findByTemplateId(id);
    if (ticketsUsingTemplate.length > 0) {
      throw new InvalidOperationException(
        'delete template',
        `Template is used by ${ticketsUsingTemplate.length} ticket(s)`
      );
    }

    return await this.templateRepository.delete(id);
  }

  async duplicateTemplate(id: string, newName: string): Promise<Template> {
    // Get original template
    const original = await this.getTemplate(id);

    // Use domain method to duplicate
    const duplicated = original.duplicate(newName);

    // Save duplicated template
    return await this.templateRepository.save(duplicated);
  }

  async setAsDefault(id: string): Promise<Template> {
    // Check if exists
    const template = await this.getTemplate(id);

    // Use repository method to set as default (unsets others)
    return await this.templateRepository.setAsDefault(id);
  }

  async importFromJSON(json: string): Promise<Template> {
    try {
      // Parse JSON
      const data = JSON.parse(json);

      // Create template from parsed data
      const template = new Template(
        data.id || `template-${Date.now()}`,
        data.name,
        data.description || '',
        data.version,
        data.isDefault || false,
        data.sections || [],
        data.createdAt ? new Date(data.createdAt) : new Date(),
        data.updatedAt ? new Date(data.updatedAt) : new Date(),
        data.author
      );

      // Validate
      template.validate();

      // Check for duplicate name
      const existing = await this.templateRepository.findByName(template.name);
      if (existing) {
        throw new DuplicateException('Template', 'name', template.name);
      }

      // Save
      return await this.templateRepository.save(template);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ValidationException('Invalid JSON format');
      }
      throw error;
    }
  }

  async exportToJSON(id: string): Promise<string> {
    const template = await this.getTemplate(id);

    // Convert to plain object
    const data = {
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      isDefault: template.isDefault,
      sections: template.sections,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      author: template.author,
    };

    return JSON.stringify(data, null, 2);
  }
}

