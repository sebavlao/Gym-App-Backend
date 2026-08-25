// Corregí el path subiendo los niveles necesarios
import type { IMembershipRepository } from '../../../gyms/domain/repositories/IMembershipRepository.js';
import { Membership } from '../../../gyms/domain/entities/Membership.js';

export class ActivateMembershipByPaymentUseCase {
  constructor(private membershipRepository: IMembershipRepository) {}

  async execute(userId: string): Promise<{ success: boolean; message: string }> {
    const memberships = await this.membershipRepository.findByUserId(userId);
    
    // Corregimos el error del tipo 'any' agregando el tipo Membership explícito
    const membershipToActivate = memberships.find((m: Membership) => m.status === 'pending');

    if (!membershipToActivate) {
      return { success: false, message: 'No se encontró ninguna membresía pendiente.' };
    }

    membershipToActivate.activate();
    await this.membershipRepository.save(membershipToActivate);

    return { success: true, message: 'Activada.' };
  }
}