import { InvalidMembershipStatusError } from '../../../../shared/domain/errors/DomainError';

export enum MembershipStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

interface MembershipProps {
  id: string;
  userId: string;
  gymId: string;
  coachId?: string | null;
  status: MembershipStatus;
}

export class Membership {
  private constructor(private readonly props: MembershipProps) {
    this.validate();
  }

  public static create(props: MembershipProps): Membership {
    return new Membership(props);
  }

  private validate(): void {
    if (!Object.values(MembershipStatus).includes(this.props.status)) {
      throw new InvalidMembershipStatusError(this.props.status);
    }
  }

  public activate(): void {
    this.props.status = MembershipStatus.Active;
  }

  public deactivate(): void {
    this.props.status = MembershipStatus.Inactive;
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get gymId(): string { return this.props.gymId; }
  get coachId(): string | null | undefined { return this.props.coachId; }
  get status(): MembershipStatus { return this.props.status; }
}
