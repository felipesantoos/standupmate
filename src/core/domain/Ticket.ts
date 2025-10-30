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

import { TicketStatus, TicketMetadata } from './types';

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
}

