import type { Training_Log } from '../../generated/prisma/client/client.js';

export interface TrainingLogRepository {
  create(data: {
    client_id: string;
    routine_exercise_id: string;
    weight_used: number;
    actual_reps: number;
    calories_burned?: number | null;
  }): Promise<Training_Log>;

  findByClientId(client_id: string): Promise<Training_Log[]>;
}