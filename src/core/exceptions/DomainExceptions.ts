/**
 * Domain Exceptions
 * 
 * Pure business logic errors.
 * Following Error Handling Strategy from guides.
 * 
 * These exceptions:
 * - Represent business rule violations
 * - Are independent of infrastructure
 * - Should be meaningful to business stakeholders
 * - Never contain HTTP status codes or database details
 */

export class DomainException extends Error {
  constructor(
    message: string,
    public code: string = 'DOMAIN_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ===================================================================
// VALIDATION ERRORS
// ===================================================================

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class RequiredFieldException extends ValidationException {
  constructor(fieldName: string) {
    super(`Field '${fieldName}' is required`);
    this.code = 'REQUIRED_FIELD';
  }
}

export class InvalidFormatException extends ValidationException {
  constructor(fieldName: string, expectedFormat: string) {
    super(`Field '${fieldName}' has invalid format. Expected: ${expectedFormat}`);
    this.code = 'INVALID_FORMAT';
  }
}

// ===================================================================
// NOT FOUND ERRORS
// ===================================================================

export class NotFoundException extends DomainException {
  constructor(entityName: string, entityId: string) {
    super(`${entityName} with ID '${entityId}' not found`);
    this.code = 'NOT_FOUND';
  }
}

export class TicketNotFoundException extends NotFoundException {
  constructor(ticketId: string) {
    super('Ticket', ticketId);
    this.code = 'TICKET_NOT_FOUND';
  }
}

export class TemplateNotFoundException extends NotFoundException {
  constructor(templateId: string) {
    super('Template', templateId);
    this.code = 'TEMPLATE_NOT_FOUND';
  }
}

// ===================================================================
// CONFLICT ERRORS
// ===================================================================

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

export class DuplicateException extends ConflictException {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} '${value}' already exists`);
    this.code = 'DUPLICATE';
  }
}

// ===================================================================
// BUSINESS LOGIC ERRORS
// ===================================================================

export class BusinessLogicException extends DomainException {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR') {
    super(message, code);
  }
}

export class InvalidOperationException extends BusinessLogicException {
  constructor(operation: string, reason: string) {
    super(`Cannot ${operation}: ${reason}`);
    this.code = 'INVALID_OPERATION';
  }
}

export class InvalidStatusTransitionException extends BusinessLogicException {
  constructor(from: string, to: string) {
    super(`Cannot transition from status '${from}' to '${to}'`);
    this.code = 'INVALID_STATUS_TRANSITION';
  }
}

