import 'dotenv/config';
import type { ExerciseRepository } from '../../domain/repositories/exercise.repository.js';
import type { Exercise } from '../../generated/prisma/client/client.js';
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaExerciseRepository implements ExerciseRepository {
  async findAll(): Promise<Exercise[]> {
    return localPrisma.exercise.findMany();
  }

  async create(data: { name: string; muscle_group: string; media_url?: string }): Promise<Exercise> {
    return localPrisma.exercise.create({
      data: {
        name: data.name,
        muscle_group: data.muscle_group,
        media_url: data.media_url ?? null,
      },
    });
  }
}