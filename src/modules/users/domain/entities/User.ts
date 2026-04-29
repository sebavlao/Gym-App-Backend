import { DomainError } from '../../../../shared/domain/errors/DomainError';
import { ClientDetail } from './ClientDetail';
import { CoachDetail } from './CoachDetail';

export enum UserRole {
  Admin = 'Admin',
  Coach = 'Coach',
  Client = 'Client',
}

interface UserProps {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  qrCode?: string | null;
  clientDetail?: ClientDetail | null;
  coachDetail?: CoachDetail | null;
}

export class User {
  private constructor(private readonly props: UserProps) {
    this.validate();
  }

  public static create(props: UserProps): User {
    return new User(props);
  }

  private validate(): void {
    if (!Object.values(UserRole).includes(this.props.role)) {
      throw new DomainError(`Invalid role: ${this.props.role}`, 'INVALID_ROLE');
    }

    if (this.props.role === UserRole.Client && this.props.coachDetail) {
      throw new DomainError(
        'A Client cannot have Coach details',
        'INVALID_RELATION',
      );
    }

    if (this.props.role === UserRole.Coach && this.props.clientDetail) {
      throw new DomainError(
        'A Coach cannot have Client details',
        'INVALID_RELATION',
      );
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get password(): string | undefined {
    return this.props.password;
  }
  get role(): UserRole {
    return this.props.role;
  }
  get qrCode(): string | null | undefined {
    return this.props.qrCode;
  }
  get clientDetail(): ClientDetail | null | undefined {
    return this.props.clientDetail;
  }
  get coachDetail(): CoachDetail | null | undefined {
    return this.props.coachDetail;
  }
}
