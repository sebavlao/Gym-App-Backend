import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import type { TrainingLogRepository } from '../../domain/repositories/ITrainingLogRepository.js';
import { TrainingLog } from '../../domain/entities/TrainingLog.js';
import { TrainingLogMapper } from './TrainingLogMapper.js';

export class PrismaTrainingLogRepository implements TrainingLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    client_id: string;
    routine_exercise_id: string;
    weight_used: number;
    actual_reps: number;
    calories_burned?: number | null;
  }): Promise<TrainingLog> {
    const raw = await this.prisma.training_Log.create({
      data: {
        client_id: data.client_id,
        routine_exercise_id: data.routine_exercise_id,
        weight_used: data.weight_used,
        actual_reps: data.actual_reps,
        calories_burned: data.calories_burned ?? null,
      },
    });
    return TrainingLogMapper.toDomain(raw);
  }

  async findByClientId(client_id: string): Promise<TrainingLog[]> {
    const raws = await this.prisma.training_Log.findMany({
      where: { client_id },
      orderBy: { id: 'desc' }
    });
    return raws.map(raw => TrainingLogMapper.toDomain(raw));
  }
}