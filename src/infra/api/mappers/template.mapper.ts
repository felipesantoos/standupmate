/**
 * Template API Mapper
 * 
 * Transforms between API DTOs and Domain entities.
 */

import { Template } from '@core/domain/Template';
import { Section, Field } from '@core/domain/types';
import { 
  TemplateResponse, 
  SectionResponse, 
  FieldResponse 
} from '../dtos/response/template.response';
import {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  SectionRequest,
  FieldRequest
} from '../dtos/request/template.request';

/**
 * Template API Mapper
 * 
 * Bidirectional transformation: API DTO ↔ Domain Model
 */
export class TemplateAPIMapper {
  /**
   * API Response → Domain Model
   */
  static toDomain(response: TemplateResponse): Template {
    const sections = response.sections.map(sectionDto => 
      this.sectionToDomain(sectionDto)
    );

    return new Template(
      response.id,
      response.name,
      response.description,
      response.version,
      response.is_default,
      sections,
      new Date(response.created_at),
      new Date(response.updated_at),
      response.author
    );
  }

  /**
   * Section Response → Domain Section
   */
  private static sectionToDomain(response: SectionResponse): Section {
    const fields = response.fields.map(fieldDto => 
      this.fieldToDomain(fieldDto)
    );

    return {
      id: response.id,
      title: response.title,
      order: response.order,
      fields,
    };
  }

  /**
   * Field Response → Domain Field
   */
  private static fieldToDomain(response: FieldResponse): Field {
    return {
      id: response.id,
      label: response.label,
      type: response.type as any, // FieldType enum
      required: response.required,
      placeholder: response.placeholder,
      order: response.order,
      validation: response.validation ? {
        minLength: response.validation.min_length,
        maxLength: response.validation.max_length,
        min: response.validation.min,
        max: response.validation.max,
        pattern: response.validation.pattern,
        message: response.validation.message,
        minItems: response.validation.min_items,
        maxItems: response.validation.max_items,
      } : undefined,
      options: response.options,
      defaultValue: response.default_value,
    };
  }

  /**
   * Domain Model → Create Request
   */
  static toCreatePayload(template: Template): CreateTemplateRequest {
    return {
      name: template.name,
      description: template.description,
      version: template.version,
      author: template.author,
      sections: template.sections.map(section => this.sectionToRequest(section)),
    };
  }

  /**
   * Domain Model → Update Request
   */
  static toUpdatePayload(template: Template): UpdateTemplateRequest {
    return {
      name: template.name,
      description: template.description,
      version: template.version,
      sections: template.sections.map(section => this.sectionToRequest(section)),
    };
  }

  /**
   * Domain Section → Section Request
   */
  private static sectionToRequest(section: Section): SectionRequest {
    return {
      id: section.id,
      title: section.title,
      order: section.order,
      fields: section.fields.map(field => this.fieldToRequest(field)),
    };
  }

  /**
   * Domain Field → Field Request
   */
  private static fieldToRequest(field: Field): FieldRequest {
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
      order: field.order,
      validation: field.validation ? {
        min_length: field.validation.minLength,
        max_length: field.validation.maxLength,
        min: field.validation.min,
        max: field.validation.max,
        pattern: field.validation.pattern,
        message: field.validation.message,
        min_items: field.validation.minItems,
        max_items: field.validation.maxItems,
      } : undefined,
      options: field.options as string[] | undefined,
      default_value: field.defaultValue,
    };
  }

  /**
   * Array of API Response → Array of Domain Model
   */
  static toDomainList(responses: TemplateResponse[]): Template[] {
    return responses.map(response => TemplateAPIMapper.toDomain(response));
  }
}

