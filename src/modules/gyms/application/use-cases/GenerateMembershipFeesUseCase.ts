import type { IMembershipFeeRepository } from '../../domain/repositories/IMembershipFeeRepository';
import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { MembershipFee } from '../../domain/entities/MembershipFee';
import { FeeStatus } from '../../../../generated/prisma/client/client';

export interface GenerateFeesCommand {
  gymId: string;
  period: string;
  amount: number;
  currency?: string;
  dueDate?: Date;
}

export interface GenerateFeesResult {
  created: number;
  skipped: number;
  fees: MembershipFee[];
}

export class GenerateMembershipFeesUseCase {
  constructor(
    private readonly feeRepository: IMembershipFeeRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(command: GenerateFeesCommand): Promise<GenerateFeesResult> {
    // Obtener todas las membresías activas del gimnasio
    const allMemberships = await this.membershipRepository.findByGymId(command.gymId);
    const activeMemberships = allMemberships.filter(m => m.status === 'active' as any);

    if (activeMemberships.length === 0) {
      return { created: 0, skipped: 0, fees: [] };
    }

    const fees: MembershipFee[] = [];
    let created = 0;
    let skipped = 0;

    for (const membership of activeMemberships) {
      // Verificar si ya existe un fee para esta membresía y período
      const existingFees = await this.feeRepository.findByMembershipId(membership.id);
      const existingFee = existingFees.find(f => f.period === command.period);

      if (existingFee) {
        skipped++;
        continue;
      }

      const fee = MembershipFee.create({
        id: crypto.randomUUID(),
        membershipId: membership.id,
        userId: membership.userId,
        period: command.period,
        amount: command.amount,
        currency: command.currency || 'UYU',
        status: FeeStatus.PENDING,
        dueDate: command.dueDate || new Date(),
      });

      await this.feeRepository.save(fee);
      fees.push(fee);
      created++;
    }

    return { created, skipped, fees };
  }
}
