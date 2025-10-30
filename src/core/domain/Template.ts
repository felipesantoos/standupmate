/**
 * Template Domain Model
 * 
 * Pure business logic - no framework dependencies.
 * Following Single Responsibility Principle (SRP).
 * 
 * Responsibilities:
 * - Represent a form template structure
 * - Enforce template validation rules
 * - Provide template operations (addSection, removeSection, etc.)
 */

import { Section, Field } from './types';

export class Template {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public version: string,
    public isDefault: boolean,
    public sections: Section[],
    public createdAt: Date,
    public updatedAt: Date,
    public author?: string
  ) {}

  /**
   * Business validation - enforces business rules
   * Throws Error if validation fails
   */
  validate(): void {
    if (!this.name || this.name.trim().length < 3) {
      throw new Error('Template name must have at least 3 characters');
    }

    if (this.name.trim().length > 200) {
      throw new Error('Template name must be at most 200 characters');
    }

    if (!this.version || this.version.trim() === '') {
      throw new Error('Template version is required');
    }

    if (!this.sections || this.sections.length === 0) {
      throw new Error('Template must have at least one section');
    }

    // Validate version format (semver-like: x.y.z)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(this.version)) {
      throw new Error('Version must follow format: x.y.z (e.g., 1.0.0)');
    }

    // Validate dates
    if (!(this.createdAt instanceof Date) || isNaN(this.createdAt.getTime())) {
      throw new Error('Created date must be a valid date');
    }

    if (!(this.updatedAt instanceof Date) || isNaN(this.updatedAt.getTime())) {
      throw new Error('Updated date must be a valid date');
    }

    // Validate sections
    this.validateSections();
  }

  /**
   * Validate sections structure
   * Private helper method
   */
  private validateSections(): void {
    const sectionIds = new Set<string>();

    this.sections.forEach((section, index) => {
      if (!section.id || section.id.trim() === '') {
        throw new Error(`Section at index ${index} must have an ID`);
      }

      if (sectionIds.has(section.id)) {
        throw new Error(`Duplicate section ID: ${section.id}`);
      }
      sectionIds.add(section.id);

      if (!section.title || section.title.trim() === '') {
        throw new Error(`Section ${section.id} must have a title`);
      }

      if (!Array.isArray(section.fields) || section.fields.length === 0) {
        throw new Error(`Section ${section.id} must have at least one field`);
      }

      // Validate fields in section
      this.validateFields(section);
    });
  }

  /**
   * Validate fields within a section
   * Private helper method
   */
  private validateFields(section: Section): void {
    const fieldIds = new Set<string>();

    section.fields.forEach((field, index) => {
      if (!field.id || field.id.trim() === '') {
        throw new Error(`Field at index ${index} in section ${section.id} must have an ID`);
      }

      if (fieldIds.has(field.id)) {
        throw new Error(`Duplicate field ID in section ${section.id}: ${field.id}`);
      }
      fieldIds.add(field.id);

      if (!field.label || field.label.trim() === '') {
        throw new Error(`Field ${field.id} must have a label`);
      }

      if (!field.type) {
        throw new Error(`Field ${field.id} must have a type`);
      }
    });
  }

  /**
   * Business operation: Add section to template
   */
  addSection(section: Section): void {
    if (!section || !section.id) {
      throw new Error('Section must have an ID');
    }

    // Check for duplicate ID
    if (this.sections.some(s => s.id === section.id)) {
      throw new Error(`Section with ID ${section.id} already exists`);
    }

    // Set order if not provided
    if (section.order === undefined) {
      section.order = this.sections.length + 1;
    }

    this.sections.push(section);
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Remove section from template
   */
  removeSection(sectionId: string): void {
    const index = this.sections.findIndex(s => s.id === sectionId);
    
    if (index === -1) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }

    if (this.sections.length === 1) {
      throw new Error('Cannot remove the last section. Template must have at least one section');
    }

    this.sections.splice(index, 1);
    
    // Reorder remaining sections
    this.reorderSections();
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Update section
   */
  updateSection(sectionId: string, updatedSection: Partial<Section>): void {
    const section = this.sections.find(s => s.id === sectionId);
    
    if (!section) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }

    Object.assign(section, updatedSection);
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Reorder sections
   */
  reorderSections(): void {
    this.sections.forEach((section, index) => {
      section.order = index + 1;
    });
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Add field to section
   */
  addFieldToSection(sectionId: string, field: Field): void {
    const section = this.sections.find(s => s.id === sectionId);
    
    if (!section) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }

    if (!field || !field.id) {
      throw new Error('Field must have an ID');
    }

    // Check for duplicate field ID in section
    if (section.fields.some(f => f.id === field.id)) {
      throw new Error(`Field with ID ${field.id} already exists in section ${sectionId}`);
    }

    // Set order if not provided
    if (field.order === undefined) {
      field.order = section.fields.length + 1;
    }

    section.fields.push(field);
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Remove field from section
   */
  removeFieldFromSection(sectionId: string, fieldId: string): void {
    const section = this.sections.find(s => s.id === sectionId);
    
    if (!section) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }

    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) {
      throw new Error(`Field with ID ${fieldId} not found in section ${sectionId}`);
    }

    if (section.fields.length === 1) {
      throw new Error('Cannot remove the last field. Section must have at least one field');
    }

    section.fields.splice(fieldIndex, 1);
    
    // Reorder remaining fields
    section.fields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    this.updatedAt = new Date();
  }

  /**
   * Business operation: Duplicate template
   * Returns a new Template instance with copied data
   */
  duplicate(newName: string): Template {
    if (!newName || newName.trim().length < 3) {
      throw new Error('New template name must have at least 3 characters');
    }

    const now = new Date();
    
    return new Template(
      `template-${Date.now()}`, // New ID
      newName,
      this.description,
      '1.0.0', // Reset version
      false, // Not default
      JSON.parse(JSON.stringify(this.sections)), // Deep copy sections
      now,
      now,
      this.author
    );
  }

  /**
   * Business operation: Create new version of template
   * Returns a new Template instance with incremented major version
   * Keeps the same name but creates a new version
   */
  createNewVersion(): Template {
    const now = new Date();
    
    // Increment major version (e.g., 1.0.0 -> 2.0.0)
    const newVersion = this.incrementMajorVersion(this.version);
    
    return new Template(
      `template-${Date.now()}`, // New ID
      this.name, // Same name
      this.description,
      newVersion, // Incremented version
      false, // Not default
      JSON.parse(JSON.stringify(this.sections)), // Deep copy sections
      now,
      now,
      this.author
    );
  }

  /**
   * Helper: Increment major version
   * Private helper for version management
   */
  private incrementMajorVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0], 10);
    return `${major + 1}.0.0`;
  }

  /**
   * Helper: Get field by ID across all sections
   */
  getFieldById(fieldId: string): Field | null {
    for (const section of this.sections) {
      const field = section.fields.find(f => f.id === fieldId);
      if (field) {
        return field;
      }
    }
    return null;
  }

  /**
   * Helper: Get total number of fields
   */
  getTotalFieldCount(): number {
    return this.sections.reduce((total, section) => total + section.fields.length, 0);
  }

  /**
   * Helper: Get required fields count
   */
  getRequiredFieldCount(): number {
    return this.sections.reduce(
      (total, section) => total + section.fields.filter(f => f.required).length,
      0
    );
  }
}

