/**
 * Unit Tests for Template Domain Model
 * 
 * Following testing best practices from guides
 */

import { describe, it, expect } from 'vitest';
import { Template } from '@core/domain/Template';
import { FieldType, Section, Field } from '@core/domain/types';

describe('Template Domain Model', () => {
  // Helper to create valid template
  const createValidTemplate = (): Template => {
    return new Template(
      'template-1',
      'Problem Solving Roadmap',
      'Template for problem solving',
      '1.0.0',
      true,
      [
        {
          id: 'section-1',
          title: 'What needs to be done?',
          order: 1,
          fields: [
            {
              id: 'field-1',
              label: 'Title',
              type: FieldType.TEXT,
              required: true,
              order: 1,
            },
          ],
        },
      ],
      new Date('2025-10-30T10:00:00Z'),
      new Date('2025-10-30T10:00:00Z'),
      'Felipe Santos'
    );
  };

  // ===================================================================
  // VALIDATION TESTS
  // ===================================================================

  describe('validate()', () => {
    it('should pass validation for valid template', () => {
      const template = createValidTemplate();
      expect(() => template.validate()).not.toThrow();
    });

    it('should throw error when name is too short', () => {
      const template = createValidTemplate();
      template.name = 'AB'; // Too short

      expect(() => template.validate()).toThrow('at least 3 characters');
    });

    it('should throw error when name is too long', () => {
      const template = createValidTemplate();
      template.name = 'A'.repeat(201); // Too long

      expect(() => template.validate()).toThrow('at most 200 characters');
    });

    it('should throw error when version is empty', () => {
      const template = createValidTemplate();
      template.version = '';

      expect(() => template.validate()).toThrow('Template version is required');
    });

    it('should throw error when version format is invalid', () => {
      const template = createValidTemplate();
      template.version = '1.0'; // Invalid format

      expect(() => template.validate()).toThrow('Version must follow format: x.y.z');
    });

    it('should accept valid semantic version', () => {
      const template = createValidTemplate();
      template.version = '2.5.3';

      expect(() => template.validate()).not.toThrow();
    });

    it('should throw error when no sections', () => {
      const template = createValidTemplate();
      template.sections = [];

      expect(() => template.validate()).toThrow('Template must have at least one section');
    });

    it('should throw error when section has no ID', () => {
      const template = createValidTemplate();
      template.sections = [
        {
          id: '',
          title: 'Test',
          order: 1,
          fields: [
            {
              id: 'field-1',
              label: 'Test',
              type: FieldType.TEXT,
              required: true,
              order: 1,
            },
          ],
        },
      ];

      expect(() => template.validate()).toThrow('Section at index 0 must have an ID');
    });

    it('should throw error when duplicate section IDs', () => {
      const template = createValidTemplate();
      template.sections = [
        {
          id: 'section-1',
          title: 'Test 1',
          order: 1,
          fields: [{ id: 'f1', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
        },
        {
          id: 'section-1', // Duplicate!
          title: 'Test 2',
          order: 2,
          fields: [{ id: 'f2', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
        },
      ];

      expect(() => template.validate()).toThrow('Duplicate section ID');
    });

    it('should throw error when section has no fields', () => {
      const template = createValidTemplate();
      template.sections = [
        {
          id: 'section-1',
          title: 'Test',
          order: 1,
          fields: [], // No fields!
        },
      ];

      expect(() => template.validate()).toThrow('Section section-1 must have at least one field');
    });

    it('should throw error when field has no ID', () => {
      const template = createValidTemplate();
      template.sections = [
        {
          id: 'section-1',
          title: 'Test',
          order: 1,
          fields: [
            {
              id: '',
              label: 'Test',
              type: FieldType.TEXT,
              required: true,
              order: 1,
            },
          ],
        },
      ];

      expect(() => template.validate()).toThrow('Field at index 0 in section section-1 must have an ID');
    });

    it('should throw error when duplicate field IDs in section', () => {
      const template = createValidTemplate();
      template.sections = [
        {
          id: 'section-1',
          title: 'Test',
          order: 1,
          fields: [
            { id: 'field-1', label: 'Test 1', type: FieldType.TEXT, required: true, order: 1 },
            { id: 'field-1', label: 'Test 2', type: FieldType.TEXT, required: true, order: 2 }, // Duplicate!
          ],
        },
      ];

      expect(() => template.validate()).toThrow('Duplicate field ID in section');
    });

    it('should throw error when template has no title field', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test Section',
            order: 1,
            fields: [
              {
                id: 'description',
                label: 'Description',
                type: FieldType.TEXTAREA,
                required: false,
                order: 1,
              },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(() => template.validate()).toThrow('Template must have a required title field');
    });

    it('should throw error when title field is not required', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test Section',
            order: 1,
            fields: [
              {
                id: 'ticket_title',
                label: 'Title',
                type: FieldType.TEXT,
                required: false, // Should be required!
                order: 1,
              },
              {
                id: 'description',
                label: 'Description',
                type: FieldType.TEXTAREA,
                required: false,
                order: 2,
              },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(() => template.validate()).toThrow('Template must have a required title field');
    });

    it('should throw error when template has no description field', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test Section',
            order: 1,
            fields: [
              {
                id: 'ticket_title',
                label: 'Title',
                type: FieldType.TEXT,
                required: true,
                order: 1,
              },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(() => template.validate()).toThrow('Template must have a description field');
    });

    it('should pass validation when template has title (required) and description (optional)', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test Section',
            order: 1,
            fields: [
              {
                id: 'ticket_title',
                label: 'Title',
                type: FieldType.TEXT,
                required: true,
                order: 1,
              },
              {
                id: 'description',
                label: 'Description',
                type: FieldType.TEXTAREA,
                required: false, // Can be optional
                order: 2,
              },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(() => template.validate()).not.toThrow();
    });

    it('should pass validation when description field is also required', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test Section',
            order: 1,
            fields: [
              {
                id: 'ticket_title',
                label: 'Title',
                type: FieldType.TEXT,
                required: true,
                order: 1,
              },
              {
                id: 'description',
                label: 'Description',
                type: FieldType.TEXTAREA,
                required: true, // Can also be required
                order: 2,
              },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(() => template.validate()).not.toThrow();
    });
  });

  // ===================================================================
  // SECTION OPERATIONS TESTS
  // ===================================================================

  describe('addSection()', () => {
    it('should add section to template', () => {
      const template = createValidTemplate();
      const newSection: Section = {
        id: 'section-2',
        title: 'New Section',
        order: 2,
        fields: [
          {
            id: 'field-2',
            label: 'New Field',
            type: FieldType.TEXT,
            required: false,
            order: 1,
          },
        ],
      };

      template.addSection(newSection);

      expect(template.sections.length).toBe(2);
      expect(template.sections[1]).toBe(newSection);
    });

    it('should auto-assign order if not provided', () => {
      const template = createValidTemplate();
      const newSection = {
        id: 'section-2',
        title: 'New Section',
        fields: [{ id: 'f1', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
      } as Section;

      template.addSection(newSection);

      expect(newSection.order).toBe(2); // Auto-assigned
    });

    it('should throw error when adding section with duplicate ID', () => {
      const template = createValidTemplate();
      const duplicateSection: Section = {
        id: 'section-1', // Duplicate!
        title: 'Duplicate',
        order: 2,
        fields: [{ id: 'f1', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
      };

      expect(() => template.addSection(duplicateSection)).toThrow(
        'Section with ID section-1 already exists'
      );
    });
  });

  describe('removeSection()', () => {
    it('should remove section from template', () => {
      const template = new Template(
        'template-1',
        'Test Template',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Section 1',
            order: 1,
            fields: [{ id: 'f1', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
          },
          {
            id: 'section-2',
            title: 'Section 2',
            order: 2,
            fields: [{ id: 'f2', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }],
          },
        ],
        new Date(),
        new Date()
      );

      template.removeSection('section-1');

      expect(template.sections.length).toBe(1);
      expect(template.sections[0].id).toBe('section-2');
    });

    it('should reorder sections after removal', () => {
      const template = new Template(
        'template-1',
        'Test',
        'Test',
        '1.0.0',
        false,
        [
          { id: 's1', title: 'S1', order: 1, fields: [{ id: 'f1', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }] },
          { id: 's2', title: 'S2', order: 2, fields: [{ id: 'f2', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }] },
          { id: 's3', title: 'S3', order: 3, fields: [{ id: 'f3', label: 'Test', type: FieldType.TEXT, required: true, order: 1 }] },
        ],
        new Date(),
        new Date()
      );

      template.removeSection('s2');

      expect(template.sections[0].order).toBe(1);
      expect(template.sections[1].order).toBe(2); // Reordered from 3 to 2
    });

    it('should throw error when removing last section', () => {
      const template = createValidTemplate();

      expect(() => template.removeSection('section-1')).toThrow(
        'Cannot remove the last section'
      );
    });

    it('should throw error when removing non-existent section', () => {
      const template = createValidTemplate();

      expect(() => template.removeSection('non-existent')).toThrow(
        'Section with ID non-existent not found'
      );
    });
  });

  // ===================================================================
  // FIELD OPERATIONS TESTS
  // ===================================================================

  describe('addFieldToSection()', () => {
    it('should add field to section', () => {
      const template = createValidTemplate();
      const newField: Field = {
        id: 'field-2',
        label: 'Description',
        type: FieldType.TEXTAREA,
        required: false,
        order: 2,
      };

      template.addFieldToSection('section-1', newField);

      expect(template.sections[0].fields.length).toBe(2);
      expect(template.sections[0].fields[1]).toBe(newField);
    });

    it('should throw error when section not found', () => {
      const template = createValidTemplate();
      const field: Field = {
        id: 'field-2',
        label: 'Test',
        type: FieldType.TEXT,
        required: true,
        order: 1,
      };

      expect(() => template.addFieldToSection('non-existent', field)).toThrow(
        'Section with ID non-existent not found'
      );
    });

    it('should throw error when adding field with duplicate ID', () => {
      const template = createValidTemplate();
      const duplicateField: Field = {
        id: 'field-1', // Duplicate!
        label: 'Duplicate',
        type: FieldType.TEXT,
        required: true,
        order: 2,
      };

      expect(() => template.addFieldToSection('section-1', duplicateField)).toThrow(
        'Field with ID field-1 already exists in section section-1'
      );
    });
  });

  describe('removeFieldFromSection()', () => {
    it('should remove field from section', () => {
      const template = new Template(
        'template-1',
        'Test',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test',
            order: 1,
            fields: [
              { id: 'field-1', label: 'Field 1', type: FieldType.TEXT, required: true, order: 1 },
              { id: 'field-2', label: 'Field 2', type: FieldType.TEXT, required: true, order: 2 },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      template.removeFieldFromSection('section-1', 'field-1');

      expect(template.sections[0].fields.length).toBe(1);
      expect(template.sections[0].fields[0].id).toBe('field-2');
    });

    it('should throw error when removing last field', () => {
      const template = createValidTemplate();

      expect(() => template.removeFieldFromSection('section-1', 'field-1')).toThrow(
        'Cannot remove the last field'
      );
    });
  });

  describe('duplicate()', () => {
    it('should create copy of template with new name', () => {
      const original = createValidTemplate();
      const duplicated = original.duplicate('Copy of Problem Solving');

      expect(duplicated.id).not.toBe(original.id);
      expect(duplicated.name).toBe('Copy of Problem Solving');
      expect(duplicated.version).toBe('1.0.0'); // Reset version
      expect(duplicated.isDefault).toBe(false); // Not default
      expect(duplicated.sections.length).toBe(original.sections.length);
    });

    it('should throw error for invalid new name', () => {
      const template = createValidTemplate();

      expect(() => template.duplicate('AB')).toThrow(
        'New template name must have at least 3 characters'
      );
    });
  });

  // ===================================================================
  // HELPER METHODS TESTS
  // ===================================================================

  describe('getFieldById()', () => {
    it('should find field across sections', () => {
      const template = new Template(
        'template-1',
        'Test',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Section 1',
            order: 1,
            fields: [{ id: 'field-1', label: 'Field 1', type: FieldType.TEXT, required: true, order: 1 }],
          },
          {
            id: 'section-2',
            title: 'Section 2',
            order: 2,
            fields: [{ id: 'field-2', label: 'Field 2', type: FieldType.TEXT, required: true, order: 1 }],
          },
        ],
        new Date(),
        new Date()
      );

      const field = template.getFieldById('field-2');

      expect(field).not.toBeNull();
      expect(field?.id).toBe('field-2');
      expect(field?.label).toBe('Field 2');
    });

    it('should return null for non-existent field', () => {
      const template = createValidTemplate();
      const field = template.getFieldById('non-existent');

      expect(field).toBeNull();
    });
  });

  describe('getTotalFieldCount()', () => {
    it('should count all fields across sections', () => {
      const template = new Template(
        'template-1',
        'Test',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Section 1',
            order: 1,
            fields: [
              { id: 'f1', label: 'F1', type: FieldType.TEXT, required: true, order: 1 },
              { id: 'f2', label: 'F2', type: FieldType.TEXT, required: true, order: 2 },
            ],
          },
          {
            id: 'section-2',
            title: 'Section 2',
            order: 2,
            fields: [
              { id: 'f3', label: 'F3', type: FieldType.TEXT, required: true, order: 1 },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(template.getTotalFieldCount()).toBe(3);
    });
  });

  describe('getRequiredFieldCount()', () => {
    it('should count only required fields', () => {
      const template = new Template(
        'template-1',
        'Test',
        'Test',
        '1.0.0',
        false,
        [
          {
            id: 'section-1',
            title: 'Test',
            order: 1,
            fields: [
              { id: 'f1', label: 'F1', type: FieldType.TEXT, required: true, order: 1 },
              { id: 'f2', label: 'F2', type: FieldType.TEXT, required: false, order: 2 },
              { id: 'f3', label: 'F3', type: FieldType.TEXT, required: true, order: 3 },
            ],
          },
        ],
        new Date(),
        new Date()
      );

      expect(template.getRequiredFieldCount()).toBe(2);
    });
  });
});

