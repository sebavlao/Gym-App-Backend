import type { IMembershipFeeRepository } from '../../domain/repositories/IMembershipFeeRepository';
import { MembershipFee } from '../../domain/entities/MembershipFee';
import { FeeStatus } from '../../../../generated/prisma/client/client';

export interface GetUserFeesQuery {
  userId: string;
  gymId: string;
}

export class GetUserMembershipFeesUseCase {
  constructor(
    private readonly feeRepository: IMembershipFeeRepository,
  ) {}

  async execute(query: GetUserFeesQuery): Promise<MembershipFee[]> {
    // Obtener fees del usuario y filtrar por los que pertenecen al gimnasio
    const allFees = await this.feeRepository.findByUserId(query.userId);
    // Como el repository no tiene filtro combinado, traemos todos los fees del gym y filtramos por userId
    const gymFees = await this.feeRepository.findByGymId(query.gymId);
    return gymFees.filter(f => f.userId === query.userId);
  }
}
