import type { DomainError } from '../../../../shared/domain/errors/DomainError';

interface ClientDetailProps {
  id: string;
  userId: string;
  bloodType?: string | null;
  pathologies?: string | null;
  emergencyContact?: string | null;
  allergies?: string | null;
  observations?: string | null;
}

export class ClientDetail {
  private constructor(private readonly props: ClientDetailProps) {}

  public static create(props: ClientDetailProps): ClientDetail {
    return new ClientDetail(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get bloodType(): string | null | undefined {
    return this.props.bloodType;
  }
  get pathologies(): string | null | undefined {
    return this.props.pathologies;
  }
  get emergencyContact(): string | null | undefined {
    return this.props.emergencyContact;
  }
  get allergies(): string | null | undefined {
    return this.props.allergies;
  }
  get observations(): string | null | undefined {
    return this.props.observations;
  }
}
