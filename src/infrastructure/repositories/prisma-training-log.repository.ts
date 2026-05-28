import 'dotenv/config';
import type { TrainingLogRepository } from '../../modules/trainings/domain/training-log.repository.js';
import type { Training_Log } from '../../generated/prisma/client/client.js';
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaTrainingLogRepository implements TrainingLogRepository {
  async create(data: {
    client_id: string;
    routine_exercise_id: string;
    weight_used: number;
    actual_reps: number;
    calories_burned?: number | null;
  }): Promise<Training_Log> {
    return localPrisma.training_Log.create({
      data: {
        client_id: data.client_id,
        routine_exercise_id: data.routine_exercise_id,
        weight_used: data.weight_used,
        actual_reps: data.actual_reps,
        calories_burned: data.calories_burned ?? null,
      },
    });
  }

  async findByClientId(client_id: string): Promise<Training_Log[]> {
    return localPrisma.training_Log.findMany({
      where: { client_id },
      orderBy: { id: 'desc' } // Los últimos entrenamientos primero
    });
  }
}