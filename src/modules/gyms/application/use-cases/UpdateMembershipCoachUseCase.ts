import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import type { IGymRoleRepository } from '../../domain/repositories/IGymRoleRepository';

export interface UpdateMembershipCoachCommand {
  membershipId: string;
  gymId: string;
  coachId: string | null;
}

export class UpdateMembershipCoachUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
    private readonly gymRoleRepository: IGymRoleRepository,
  ) {}

  async execute(command: UpdateMembershipCoachCommand): Promise<void> {
    const membership = await this.membershipRepository.findById(command.membershipId);
    
    if (!membership) {
      throw new Error('Membresía no encontrada');
    }
    
    if (membership.gymId !== command.gymId) {
      throw new Error('La membresía no pertenece a este gimnasio');
    }
    
    // Si se asigna un coach, verificar que tenga rol de COACH en el gimnasio
    if (command.coachId) {
      const coachRoles = await this.gymRoleRepository.findRolesByUserAndGym(command.coachId, command.gymId);
      if (!coachRoles.includes('COACH')) {
        throw new Error('El usuario asignado no tiene rol de COACH en este gimnasio');
      }
    }
    
    membership.coachId = command.coachId;
    await this.membershipRepository.update(membership);
  }
}
