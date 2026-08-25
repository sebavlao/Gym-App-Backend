import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { MembershipStatus } from '../../domain/entities/Membership';

export interface UpdateMembershipStatusCommand {
  membershipId: string;
  gymId: string;
  status: 'active' | 'inactive' | 'pending';
}

export class UpdateMembershipStatusUseCase {
  constructor(
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(command: UpdateMembershipStatusCommand): Promise<void> {
    const membership = await this.membershipRepository.findById(command.membershipId);
    
    if (!membership) {
      throw new Error('Membresía no encontrada');
    }
    
    if (membership.gymId !== command.gymId) {
      throw new Error('La membresía no pertenece a este gimnasio');
    }
    
    // Actualizar estado
    switch (command.status) {
      case 'active':
        membership.activate();
        break;
      case 'inactive':
        membership.deactivate();
        break;
      case 'pending':
        // Para pending, necesitamos un método o asignación directa
        (membership as any).status = MembershipStatus.Pending;
        break;
    }
    
    await this.membershipRepository.update(membership);
  }
}
