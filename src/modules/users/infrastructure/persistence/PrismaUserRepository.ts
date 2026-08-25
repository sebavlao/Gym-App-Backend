import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserMapper } from './UserMapper';
import { PrismaClient } from '../../../../generated/prisma/client/client';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        clientDetail: true,
        coachDetail: true,
      },
    });

    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
      include: {
        clientDetail: true,
        coachDetail: true,
      },
    });

    if (!prismaUser) return null;
    return UserMapper.toDomain(prismaUser);
  }

  async findUsersByGymAndRole(gymId: string, role: string): Promise<User[]> {
    const gymRoles = await this.prisma.gymRole.findMany({
      where: {
        gym_id: gymId,
        role: role as any,
      },
      include: {
        user: {
          include: {
            clientDetail: true,
            coachDetail: true,
          },
        },
      },
    });

    return gymRoles.map(gr => UserMapper.toDomain(gr.user));
  }

  async save(user: User): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await this.prisma.user.create({
      data: {
        ...persistenceData,
        clientDetail: user.clientDetail
          ? {
              create: {
                id: user.clientDetail.id,
                blood_type: user.clientDetail.bloodType,
                pathologies: user.clientDetail.pathologies,
                emergency_contact: user.clientDetail.emergencyContact,
                allergies: user.clientDetail.allergies,
                observations: user.clientDetail.observations,
              },
            }
          : undefined,
        coachDetail: user.coachDetail
          ? {
              create: {
                id: user.coachDetail.id,
                blood_type: user.coachDetail.bloodType,
                pathologies: user.coachDetail.pathologies,
                allergies: user.coachDetail.allergies,
                observations: user.coachDetail.observations,
                emergency_contact: user.coachDetail.emergencyContact,
              },
            }
          : undefined,
      },
    });
  }

  async update(user: User): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await this.prisma.user.update({
      where: { id: user.id },
      data: persistenceData,
    });
    // In a complete implementation we would also handle updating clientDetail / coachDetail here
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
