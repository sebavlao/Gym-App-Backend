import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import QRCode from 'qrcode';

export class GetMembershipQrUseCase {
  constructor(private membershipRepository: IMembershipRepository) {}

  async execute(membershipId: string): Promise<string> {
    const membership = await this.membershipRepository.findById(membershipId);
    if (!membership) {
      throw new Error('La membresía especificada no existe.');
    }

    const qrPayload = {
      membershipId: membership.id,
      userId: membership.userId,
      gymId: membership.gymId,
      status: membership.status,
      generatedAt: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrPayload);
    return await QRCode.toDataURL(qrString);
  }
}