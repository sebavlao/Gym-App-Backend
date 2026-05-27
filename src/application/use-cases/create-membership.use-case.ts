import type { MembershipRepository } from '../../domain/repositories/membership.repository.js';
import type { Membership } from '../../generated/prisma/client/client.js';

interface CreateMembershipInput {
  user_id: string;
  gym_id: string;
  coach_id?: string | null;
  status: string;
}

export class CreateMembershipUseCase {
  constructor(private membershipRepository: MembershipRepository) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    if (!input.user_id || !input.gym_id || !input.status) {
      throw new Error('Faltan datos clave para crear la membresía (user_id, gym_id o status).');
    }

    return this.membershipRepository.create({
      user_id: input.user_id,
      gym_id: input.gym_id,
      coach_id: input.coach_id ?? null,
      status: input.status,
    });
  }
}