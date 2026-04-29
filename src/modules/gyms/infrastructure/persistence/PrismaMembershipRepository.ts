import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { Membership } from '../../domain/entities/Membership';
import { MembershipMapper } from './MembershipMapper';
import { PrismaClient } from '../../../../generated/prisma/client/client';

export class PrismaMembershipRepository implements IMembershipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Membership | null> {
    const prismaMembership = await this.prisma.membership.findUnique({
      where: { id },
      include: {
        user: true,
        gym: true,
        coach: true,
      },
    });

    if (!prismaMembership) return null;
    return MembershipMapper.toDomain(prismaMembership);
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const prismaMemberships = await this.prisma.membership.findMany({
      where: { user_id: userId },
      include: {
        user: true,
        gym: true,
        coach: true,
      },
    });

    return prismaMemberships.map(MembershipMapper.toDomain);
  }

  async save(membership: Membership): Promise<void> {
    const persistenceData = MembershipMapper.toPersistence(membership);

    await this.prisma.membership.create({
      data: persistenceData,
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
