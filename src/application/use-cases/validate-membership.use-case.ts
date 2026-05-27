import type { MembershipRepository } from '../../domain/repositories/membership.repository.js';
import type { Membership } from '../../generated/prisma/client/client.js';

export class ValidateMembershipUseCase {
  constructor(private membershipRepository: MembershipRepository) {}

  async execute(membershipId: string): Promise<{ accessGranted: boolean; membership: Membership; message: string }> {
    const membership = await this.membershipRepository.findById(membershipId);

    if (!membership) {
      throw new Error('Acceso denegado: La membresía escaneada no existe en el sistema.');
    }

    if (membership.status.toLowerCase() !== 'active') {
      return {
        accessGranted: false,
        membership,
        message: `Acceso denegado: La membresía se encuentra en estado '${membership.status}'.`
      };
    }

    return {
      accessGranted: true,
      membership,
      message: 'Acceso concedido. ¡Buen entrenamiento!'
    };
  }
}