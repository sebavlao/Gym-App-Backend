export class DomainError extends Error {
  // Hacemos que 'code' sea opcional con el valor por defecto 'DOMAIN_ERROR'
  constructor(public readonly message: string, public readonly code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class InvalidRoleError extends DomainError {
  constructor(role: string) {
    super(`Invalid role: ${role}`, 'INVALID_ROLE');
  }
}

export class InvalidMembershipStatusError extends DomainError {
  constructor(status: string) {
    super(`Invalid membership status: ${status}`, 'INVALID_MEMBERSHIP_STATUS');
  }
}

export class MissingMedicalFieldsError extends DomainError {
  constructor(fields: string[]) {
    super(`Missing mandatory medical fields: ${fields.join(', ')}`, 'MISSING_MEDICAL_FIELDS');
  }
}