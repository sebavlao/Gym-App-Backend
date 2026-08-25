import type { IGymRoleRepository, GymRoleWithGym } from '../../domain/repositories/IGymRoleRepository.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';

export class PrismaGymRoleRepository implements IGymRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findGymsByUserId(userId: string): Promise<GymRoleWithGym[]> {
    const gymRoles = await this.prisma.gymRole.findMany({
      where: { user_id: userId },
      include: { gym: true },
    });

    const gymMap = new Map<string, GymRoleWithGym>();

    for (const gr of gymRoles) {
      const existing = gymMap.get(gr.gym_id);

      if (existing) {
        if (!existing.roles.includes(gr.role)) {
          existing.roles.push(gr.role);
        }
      } else {
        gymMap.set(gr.gym_id, {
          gymId: gr.gym_id,
          gymName: gr.gym.name,
          roles: [gr.role],
        });
      }
    }

    return Array.from(gymMap.values());
  }

  async findRolesByUserAndGym(userId: string, gymId: string): Promise<string[]> {
    const gymRoles = await this.prisma.gymRole.findMany({
      where: {
        user_id: userId,
        gym_id: gymId,
      },
      select: { role: true },
    });

    return gymRoles.map(gr => gr.role);
  }
}
