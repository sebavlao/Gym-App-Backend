import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { Membership, MembershipStatus } from '../../domain/entities/Membership.js';

export interface CreateMembershipCommand {
  id: string;
  userId: string;
  gymId: string;
  coachId?: string;
  status?: string; // <-- Agregamos status opcional al comando
}

export class CreateMembershipUseCase {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async execute(command: CreateMembershipCommand): Promise<void> {
    // Si viene un estado en el comando, lo mapeamos al Enum. Si no, va Pending por defecto.
    let initialStatus = MembershipStatus.Pending;
    
    if (command.status) {
      if (command.status === 'active') initialStatus = MembershipStatus.Active;
      if (command.status === 'inactive') initialStatus = MembershipStatus.Inactive;
    }

    const membership = Membership.create({
      id: command.id,
      userId: command.userId,
      gymId: command.gymId,
      coachId: command.coachId,
      status: initialStatus,
    });

    await this.membershipRepository.save(membership);
  }
}