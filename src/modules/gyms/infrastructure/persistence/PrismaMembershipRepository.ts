import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { Membership } from '../../domain/entities/Membership.js';
import { MembershipMapper } from './MembershipMapper.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';

export class PrismaMembershipRepository implements IMembershipRepository {
  // Centralizamos la inclusión de relaciones para no repetir código
  private readonly includeRelations = {
    user: true,
    gym: true,
    coach: true,
  };

  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Membership | null> {
    const prismaMembership = await this.prisma.membership.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!prismaMembership) return null;
    return MembershipMapper.toDomain(prismaMembership);
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: { user_id: userId },
      include: this.includeRelations,
    });

    return prismaMemberships.map(MembershipMapper.toDomain);
  }

  // FIX CRÍTICO: Usamos upsert para que "save" sirva tanto para crear como para actualizar sin romper llaves primarias
  async save(membership: Membership): Promise<void> {
    const persistenceData = MembershipMapper.toPersistence(membership);

    await this.prisma.membership.upsert({
      where: { id: membership.id },
      update: persistenceData,
      create: persistenceData,
    });
  }

  async update(membership: Membership): Promise<void> {
    const persistenceData = MembershipMapper.toPersistence(membership);

    await this.prisma.membership.update({
      where: { id: membership.id },
      data: persistenceData,
    });
  }
}