import { TrainingLog } from '../entities/TrainingLog.js';

export interface TrainingLogRepository {
  create(data: {
    client_id: string;
    routine_exercise_id: string;
    weight_used: number;
    actual_reps: number;
    calories_burned?: number | null;
  }): Promise<TrainingLog>; // <-- Ahora devolvemos la Entidad

  findByClientId(client_id: string): Promise<TrainingLog[]>; // <-- Ahora devolvemos array de Entidades
}