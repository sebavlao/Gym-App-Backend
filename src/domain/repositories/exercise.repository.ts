import type { Exercise } from '../../generated/prisma/client/client.js';

export interface ExerciseRepository {
  findAll(): Promise<Exercise[]>;
  create(data: { name: string; muscle_group: string; media_url?: string }): Promise<Exercise>;
}