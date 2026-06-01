import { TrainingLog } from '../../domain/entities/TrainingLog.js';
import type { Training_Log as PrismaTrainingLog } from '../../../../generated/prisma/client/client.js';

export class TrainingLogMapper {
  static toDomain(raw: PrismaTrainingLog): TrainingLog {
    return TrainingLog.create({
      id: raw.id,
      clientId: raw.client_id,
      routineExerciseId: raw.routine_exercise_id,
      weightUsed: raw.weight_used,
      actualReps: raw.actual_reps,
      caloriesBurned: raw.calories_burned,
      recordedAt: raw.recorded_at
    });
  }

  static toPersistence(log: TrainingLog) {
    return {
      id: log.id,
      client_id: log.clientId,
      routine_exercise_id: log.routineExerciseId,
      weight_used: log.weightUsed,
      actual_reps: log.actualReps,
      calories_burned: log.caloriesBurned ?? null,
      recorded_at: log.recordedAt ?? new Date()
    };
  }
}