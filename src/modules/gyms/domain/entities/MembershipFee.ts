import { FeeStatus } from '../../../../generated/prisma/client/client';

export interface MembershipFeeProps {
  id: string;
  membershipId: string;
  userId: string;
  period: string;
  amount: number;
  currency: string;
  status: FeeStatus;
  dueDate: Date;
  paidAt?: Date | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MembershipFee {
  private constructor(private readonly props: MembershipFeeProps) {}

  public static create(props: MembershipFeeProps): MembershipFee {
    return new MembershipFee(props);
  }

  public markAsPaid(): void {
    (this.props as any).status = FeeStatus.PAID;
    (this.props as any).paidAt = new Date();
  }

  public markAsPending(): void {
    (this.props as any).status = FeeStatus.PENDING;
    (this.props as any).paidAt = null;
  }

  public markAsWaived(): void {
    (this.props as any).status = FeeStatus.WAIVED;
    (this.props as any).paidAt = null;
  }

  get id(): string { return this.props.id; }
  get membershipId(): string { return this.props.membershipId; }
  get userId(): string { return this.props.userId; }
  get period(): string { return this.props.period; }
  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }
  get status(): FeeStatus { return this.props.status; }
  get dueDate(): Date { return this.props.dueDate; }
  get paidAt(): Date | null | undefined { return this.props.paidAt; }
  get notes(): string | null | undefined { return this.props.notes; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }
}
