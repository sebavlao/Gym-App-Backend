import type { IMembershipFeeRepository } from '../../domain/repositories/IMembershipFeeRepository.js';
import { MembershipFee } from '../../domain/entities/MembershipFee.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';

export class PrismaMembershipFeeRepository implements IMembershipFeeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MembershipFee | null> {
    const fee = await this.prisma.membershipFee.findUnique({
      where: { id },
    });

    if (!fee) return null;

    return MembershipFee.create({
      id: fee.id,
      membershipId: fee.membership_id,
      userId: fee.user_id,
      period: fee.period,
      amount: fee.amount,
      currency: fee.currency,
      status: fee.status,
      dueDate: fee.due_date,
      paidAt: fee.paid_at,
      notes: fee.notes,
      createdAt: fee.created_at,
      updatedAt: fee.updated_at,
    });
  }

  async findByMembershipId(membershipId: string): Promise<MembershipFee[]> {
    const fees = await this.prisma.membershipFee.findMany({
      where: { membership_id: membershipId },
      orderBy: { due_date: 'desc' },
    });

    return fees.map(fee => MembershipFee.create({
      id: fee.id,
      membershipId: fee.membership_id,
      userId: fee.user_id,
      period: fee.period,
      amount: fee.amount,
      currency: fee.currency,
      status: fee.status,
      dueDate: fee.due_date,
      paidAt: fee.paid_at,
      notes: fee.notes,
      createdAt: fee.created_at,
      updatedAt: fee.updated_at,
    }));
  }

  async findByUserId(userId: string): Promise<MembershipFee[]> {
    const fees = await this.prisma.membershipFee.findMany({
      where: { user_id: userId },
      orderBy: { due_date: 'desc' },
    });

    return fees.map(fee => MembershipFee.create({
      id: fee.id,
      membershipId: fee.membership_id,
      userId: fee.user_id,
      period: fee.period,
      amount: fee.amount,
      currency: fee.currency,
      status: fee.status,
      dueDate: fee.due_date,
      paidAt: fee.paid_at,
      notes: fee.notes,
      createdAt: fee.created_at,
      updatedAt: fee.updated_at,
    }));
  }

  async findByGymId(gymId: string): Promise<MembershipFee[]> {
    const fees = await this.prisma.membershipFee.findMany({
      where: {
        membership: {
          gym_id: gymId,
        },
      },
      orderBy: { due_date: 'desc' },
    });

    return fees.map(fee => MembershipFee.create({
      id: fee.id,
      membershipId: fee.membership_id,
      userId: fee.user_id,
      period: fee.period,
      amount: fee.amount,
      currency: fee.currency,
      status: fee.status,
      dueDate: fee.due_date,
      paidAt: fee.paid_at,
      notes: fee.notes,
      createdAt: fee.created_at,
      updatedAt: fee.updated_at,
    }));
  }

  async save(fee: MembershipFee): Promise<void> {
    await this.prisma.membershipFee.create({
      data: {
        id: fee.id,
        membership_id: fee.membershipId,
        user_id: fee.userId,
        period: fee.period,
        amount: fee.amount,
        currency: fee.currency,
        status: fee.status,
        due_date: fee.dueDate,
        paid_at: fee.paidAt,
        notes: fee.notes,
      },
    });
  }

  async update(fee: MembershipFee): Promise<void> {
    await this.prisma.membershipFee.update({
      where: { id: fee.id },
      data: {
        status: fee.status,
        paid_at: fee.paidAt,
        notes: fee.notes,
      },
    });
  }
}
