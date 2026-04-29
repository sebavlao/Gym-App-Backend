import { MissingMedicalFieldsError } from '../../../../shared/domain/errors/DomainError';

interface ClientDetailProps {
  id: string;
  userId: string;
  bloodType: string; // Made mandatory per requirement
  pathologies: string; // Made mandatory per requirement
  emergencyContact: string; // Made mandatory per requirement
  allergies?: string | null;
  observations?: string | null;
}

export class ClientDetail {
  private constructor(private readonly props: ClientDetailProps) {
    this.validate();
  }

  public static create(props: ClientDetailProps): ClientDetail {
    return new ClientDetail(props);
  }

  private validate(): void {
    const missingFields: string[] = [];
    if (!this.props.bloodType) missingFields.push('bloodType');
    if (!this.props.pathologies) missingFields.push('pathologies');
    if (!this.props.emergencyContact) missingFields.push('emergencyContact');

    if (missingFields.length > 0) {
      throw new MissingMedicalFieldsError(missingFields);
    }
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get bloodType(): string {
    return this.props.bloodType;
  }
  get pathologies(): string {
    return this.props.pathologies;
  }
  get emergencyContact(): string {
    return this.props.emergencyContact;
  }
  get allergies(): string | null | undefined {
    return this.props.allergies;
  }
  get observations(): string | null | undefined {
    return this.props.observations;
  }
}
