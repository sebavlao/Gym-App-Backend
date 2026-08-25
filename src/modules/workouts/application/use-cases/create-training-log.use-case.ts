import { TrainingLog } from '../../domain/entities/TrainingLog.js';
import type { TrainingLogRepository } from '../../domain/repositories/ITrainingLogRepository.js';

interface CreateTrainingLogInput {
  client_id: string;
  routine_exercise_id: string;
  weight_used: number;
  actual_reps: number;
  calories_burned?: number | null;
}

export class CreateTrainingLogUseCase {
  constructor(private trainingLogRepository: TrainingLogRepository) {}

  async execute(input: CreateTrainingLogInput): Promise<TrainingLog> {
    if (!input.client_id || !input.routine_exercise_id) {
      throw new Error('Faltan datos clave: client_id o routine_exercise_id.');
    }

    // Instanciamos la entidad de dominio para asegurar consistencia y validación de reglas de negocio
    const trainingLog = TrainingLog.create({
      id: crypto.randomUUID(),
      clientId: input.client_id,
      routineExerciseId: input.routine_exercise_id,
      weightUsed: input.weight_used,
      actualReps: input.actual_reps,
      caloriesBurned: input.calories_burned ?? null,
      recordedAt: new Date()
    });

    // Pasamos los datos estructurados al repositorio como pide la interfaz limpia
    return this.trainingLogRepository.create({
      client_id: trainingLog.clientId,
      routine_exercise_id: trainingLog.routineExerciseId,
      weight_used: trainingLog.weightUsed,
      actual_reps: trainingLog.actualReps,
      calories_burned: trainingLog.caloriesBurned
    });
  }
}