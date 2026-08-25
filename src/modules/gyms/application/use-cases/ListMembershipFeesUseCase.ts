import type { IMembershipFeeRepository } from '../../domain/repositories/IMembershipFeeRepository';
import { MembershipFee } from '../../domain/entities/MembershipFee';
import { FeeStatus } from '../../../../generated/prisma/client/client';

export type EffectiveFeeStatus = FeeStatus | 'OVERDUE';

export interface ListFeesQuery {
  gymId: string;
  period?: string;
  status?: FeeStatus;
  clientId?: string;
}

export class FeeWithEffectiveStatus {
  readonly id: string;
  readonly membershipId: string;
  readonly userId: string;
  readonly period: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: FeeStatus;
  readonly effectiveStatus: EffectiveFeeStatus;
  readonly dueDate: Date;
  readonly paidAt: Date | null | undefined;
  readonly notes: string | null | undefined;
  readonly createdAt: Date | undefined;
  readonly updatedAt: Date | undefined;

  constructor(fee: MembershipFee, effectiveStatus: EffectiveFeeStatus) {
    this.id = fee.id;
    this.membershipId = fee.membershipId;
    this.userId = fee.userId;
    this.period = fee.period;
    this.amount = fee.amount;
    this.currency = fee.currency;
    this.status = fee.status;
    this.effectiveStatus = effectiveStatus;
    this.dueDate = fee.dueDate;
    this.paidAt = fee.paidAt;
    this.notes = fee.notes;
    this.createdAt = fee.createdAt;
    this.updatedAt = fee.updatedAt;
  }
}

export class ListMembershipFeesUseCase {
  constructor(
    private readonly feeRepository: IMembershipFeeRepository,
  ) {}

  async execute(query: ListFeesQuery): Promise<FeeWithEffectiveStatus[]> {
    const fees = await this.feeRepository.findByGymId(query.gymId);

    let filtered = fees;

    if (query.period) {
      filtered = filtered.filter(f => f.period === query.period);
    }

    if (query.status) {
      filtered = filtered.filter(f => f.status === query.status);
    }

    if (query.clientId) {
      filtered = filtered.filter(f => f.userId === query.clientId);
    }

    const now = new Date();
    return filtered.map(fee => {
      let effectiveStatus: EffectiveFeeStatus = fee.status;
      if (fee.status === FeeStatus.PENDING && fee.dueDate < now) {
        effectiveStatus = 'OVERDUE';
      }
      return new FeeWithEffectiveStatus(fee, effectiveStatus);
    });
  }
}
