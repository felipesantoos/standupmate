/**
 * Ticket Domain Model
 * 
 * Pure business logic - no framework dependencies.
 * Following Single Responsibility Principle (SRP).
 * 
 * Responsibilities:
 * - Represent a work ticket
 * - Enforce business validation rules
 * - Provide business operations (markAsCompleted, canBeArchived, etc.)
 */

import { TicketStatus, TicketMetadata, Field } from './types';
import { Template } from './Template';

export class Ticket {
  constructor(
    public id: string,
    public templateId: string,
    public templateVersion: string,
    public status: TicketStatus,
    public data: Record<string, any>,
    public metadata: TicketMetadata,
    public tags: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public completedAt?: Date
  ) {}

  /**
   * Business validation - enforces business rules
   * Throws Error if validation fails
   */
  validate(): void {
    if (!this.templateId || this.templateId.trim() === '') {
      throw new Error('Template ID is required');
    }

    if (!this.templateVersion || this.templateVersion.trim() === '') {
      throw new Error('Template version is required');
    }

    if (!this.data || Object.keys(this.data).length === 0) {
      throw new Error('Ticket must have data');
    }

    if (!this.metadata || !this.metadata.dev || this.metadata.dev.trim() === '') {
      throw new Error('Developer name is required in metadata');
    }

    if (!Array.isArray(this.tags)) {
      throw new Error('Tags must be an array');
    }

    // Validate status
    if (!Object.values(TicketStatus).includes(this.status)) {
      throw new Error(`Invalid ticket status: ${this.status}`);
    }

    // Validate dates
    if (!(this.createdAt instanceof Date) || isNaN(this.createdAt.getTime())) {
      throw new Error('Created date must be a valid date');
    }

    if (!(this.updatedAt instanceof Date) || isNaN(this.updatedAt.getTime())) {
      throw new Error('Updated date must be a valid date');
    }

    // Completed tickets must have completedAt
    if (this.status === TicketStatus.COMPLETED && !this.completedAt) {
      throw new Error('Completed tickets must have completion date');
    }
  }

  /**
   * Business operation: Mark ticket as completed
   * Enforces business rules (can't complete already completed ticket)
   */
  markAsCompleted(): void {
    if (this.status === TicketStatus.COMPLETED) {
      throw new Error('Ticket is already completed');
    }

    this.status = TicketStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Mark ticket as in progress
   */
  markAsInProgress(): void {
    if (this.status === TicketStatus.COMPLETED) {
      throw new Error('Cannot move completed ticket back to in progress');
    }

    this.status = TicketStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Archive ticket
   * Can only archive completed tickets
   */
  archive(): void {
    if (!this.canBeArchived()) {
      throw new Error('Only completed tickets can be archived');
    }

    this.status = TicketStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  /**
   * Business rule: Check if ticket can be archived
   */
  canBeArchived(): boolean {
    return this.status === TicketStatus.COMPLETED;
  }

  /**
   * Business rule: Check if ticket is editable
   */
  isEditable(): boolean {
    return this.status !== TicketStatus.ARCHIVED;
  }

  /**
   * Business operation: Add tag
   */
  addTag(tag: string): void {
    if (!tag || tag.trim() === '') {
      throw new Error('Tag cannot be empty');
    }

    const normalizedTag = tag.trim().toLowerCase();
    
    if (this.tags.includes(normalizedTag)) {
      return; // Tag already exists
    }

    this.tags.push(normalizedTag);
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Remove tag
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Helper: Get time spent (if tracked)
   */
  getTimeSpent(): string | null {
    return this.metadata.actualTime || null;
  }

  /**
   * Helper: Get estimate
   */
  getEstimate(): string | null {
    return this.metadata.estimate || null;
  }

  /**
   * Helper: Get ticket title (tries multiple common field names)
   */
  getTitle(): string {
    // Try exact matches first (common field IDs)
    const exactMatches = [
      'title',
      'ticket_title',
      'name',
      'ticket_name',
      'titulo',
      'nome',
    ];
    
    for (const fieldId of exactMatches) {
      if (this.data[fieldId] && typeof this.data[fieldId] === 'string' && this.data[fieldId].trim()) {
        return this.data[fieldId];
      }
    }
    
    // Try case-insensitive partial matches for title-like fields
    const dataKeys = Object.keys(this.data);
    for (const key of dataKeys) {
      const lowerKey = key.toLowerCase();
      // Must contain 'title' or 'titulo' or 'nome' but NOT 'description' related words
      if ((lowerKey.includes('title') || lowerKey.includes('titulo') || lowerKey.includes('nome')) &&
          !lowerKey.includes('description') && !lowerKey.includes('descricao') && 
          !lowerKey.includes('details') && !lowerKey.includes('detalhes') &&
          this.data[key] && typeof this.data[key] === 'string' && this.data[key].trim()) {
        return this.data[key];
      }
    }
    
    // If no title field found, return the ticket ID instead of guessing
    return `Ticket #${this.id.substring(0, 8)}`;
  }

  /**
   * Helper: Get ticket description (tries multiple common field names)
   */
  getDescription(): string {
    // Try exact matches first
    const exactMatches = [
      'description',
      'ticket_description',
      'details',
      'descricao',
      'detalhes',
    ];
    
    for (const fieldId of exactMatches) {
      if (this.data[fieldId] && typeof this.data[fieldId] === 'string' && this.data[fieldId].trim()) {
        return this.data[fieldId];
      }
    }
    
    // Try case-insensitive partial matches
    const dataKeys = Object.keys(this.data);
    for (const key of dataKeys) {
      const lowerKey = key.toLowerCase();
      if ((lowerKey.includes('description') || lowerKey.includes('descricao') || lowerKey.includes('details') || lowerKey.includes('detalhes')) &&
          this.data[key] && typeof this.data[key] === 'string' && this.data[key].trim()) {
        return this.data[key];
      }
    }
    
    return '';
  }

  /**
   * Helper: Get blocker information (tries multiple common field names)
   * Returns the blocker text if present, null otherwise
   * 
   * Consolidates blockers from multiple fields:
   * - blockers (preparation phase)
   * - daily_blockers (daily standup)
   */
  getBlocker(): string | null {
    // Try exact matches first
    const exactMatches = [
      'blocker',
      'blockers',
      'daily_blockers',
      'blocked_by',
      'impediment',
      'impediments',
      'blocking_issue',
      'impedimento',
      'impedimentos',
      'bloqueador',
      'bloqueadores',
    ];
    
    const validBlockers: string[] = [];
    
    for (const fieldId of exactMatches) {
      if (this.data[fieldId] && typeof this.data[fieldId] === 'string' && this.data[fieldId].trim()) {
        validBlockers.push(this.data[fieldId].trim());
      }
    }
    
    // Try case-insensitive partial matches
    if (validBlockers.length === 0) {
      const dataKeys = Object.keys(this.data);
      for (const key of dataKeys) {
        const lowerKey = key.toLowerCase();
        if ((lowerKey.includes('blocker') || lowerKey.includes('blocked') || 
             lowerKey.includes('impediment') || lowerKey.includes('impedimento') ||
             lowerKey.includes('bloqueador')) &&
            this.data[key] && typeof this.data[key] === 'string' && this.data[key].trim()) {
          validBlockers.push(this.data[key].trim());
        }
      }
    }

    if (validBlockers.length === 0) {
      return null;
    }

    // If multiple blocker fields exist, combine them with line breaks
    return validBlockers.join('\n\n');
  }

  /**
   * Helper: Check if ticket has a blocker
   */
  hasBlocker(): boolean {
    return this.getBlocker() !== null;
  }

  /**
   * Business validation: Validate required fields
   * Checks if all required fields from template are filled
   * 
   * @param template - Template to validate against
   * @returns Object with validation result and missing fields
   */
  validateRequiredFields(template: Template): { isValid: boolean; missingFields: Field[] } {
    const requiredFields = template.getRequiredFields();
    const missingFields: Field[] = [];

    for (const field of requiredFields) {
      const value = this.data[field.id];
      
      // Check if field is missing or empty
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
      
      // For arrays (like multi-select), check if empty
      if (Array.isArray(value) && value.length === 0) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

