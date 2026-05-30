import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { Membership } from '../../domain/entities/Membership.js';

// 1. Definimos la estructura del paquete de datos
interface MembershipData {
  userName: string;
  userEmail: string;
  status: string;
}

// 2. Definimos el tipo de retorno completo
interface ValidationResult {
  accessGranted: boolean;
  membership: Membership;
  message: string;
  data: MembershipData; // Acá incluimos la propiedad nueva
}

export class ValidateMembershipUseCase {
  constructor(private membershipRepository: IMembershipRepository) {}

  // 3. Actualizamos la firma del método para que retorne el nuevo tipo
  async execute(membershipId: string): Promise<ValidationResult> {
    const membership = await this.membershipRepository.findById(membershipId);
    
    if (!membership) {
      throw new Error('Acceso denegado: La membresía escaneada no existe en el sistema.');
    }

    if (membership.status !== 'active') {
      return {
        accessGranted: false,
        membership,
        message: `Acceso denegado: La membresía se encuentra en estado '${membership.status}'.`,
        data: {
          userName: membership.userDetails?.name || 'Cliente',
          userEmail: membership.userDetails?.email || 'N/A',
          status: membership.status
        }
      };
    }

    return {
      accessGranted: true,
      membership,
      data: {
        userName: membership.userDetails?.name || 'Cliente',
        userEmail: membership.userDetails?.email || 'N/A',
        status: membership.status
      },
      message: 'Acceso concedido. ¡Buen entrenamiento!'
    };
  }
}