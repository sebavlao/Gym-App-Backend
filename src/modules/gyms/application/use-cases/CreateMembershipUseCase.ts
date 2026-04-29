import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { Membership, MembershipStatus } from '../../domain/entities/Membership';

export interface CreateMembershipCommand {
  id: string;
  userId: string;
  gymId: string;
  coachId?: string;
}

export class CreateMembershipUseCase {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async execute(command: CreateMembershipCommand): Promise<void> {
    const membership = Membership.create({
      id: command.id,
      userId: command.userId,
      gymId: command.gymId,
      coachId: command.coachId,
      status: MembershipStatus.Pending, // Starts as pending by default
    });

    await this.membershipRepository.save(membership);
  }
}
