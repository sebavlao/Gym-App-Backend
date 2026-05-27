import type { MembershipRepository } from '../../domain/repositories/membership.repository.js';
import QRCode from 'qrcode';

export class GetMembershipQrUseCase {
  constructor(private membershipRepository: MembershipRepository) {}

  async execute(membershipId: string): Promise<string> {
    const membership = await this.membershipRepository.findById(membershipId);

    if (!membership) {
      throw new Error('La membresía especificada no existe.');
    }

    // Armamos el payload con los datos clave que leerá el lector del gimnasio
    const qrPayload = {
      membershipId: membership.id,
      userId: membership.user_id,
      gymId: membership.gym_id,
      status: membership.status,
      generatedAt: new Date().toISOString()
    };

    // Transformamos el objeto JSON en un String y lo convertimos a DataURL (Base64)
    const qrString = JSON.stringify(qrPayload);
    const qrBase64 = await QRCode.toDataURL(qrString);

    return qrBase64;
  }
}