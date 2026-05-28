import 'dotenv/config';
import type { GymRepository } from '../../domain/repositories/IGymRepository.js';
import type { Gym } from '../../../../generated/prisma/client/client.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaGymRepository implements GymRepository {
  async create(data: { name: string; address: string }): Promise<Gym> {
    return localPrisma.gym.create({
      data: {
        name: data.name,
        address: data.address,
      },
    });
  }

  async findAll(): Promise<Gym[]> {
    return localPrisma.gym.findMany();
  }

  async findById(id: string): Promise<Gym | null> {
    return localPrisma.gym.findUnique({
      where: { id },
    });
  }
}