import type { Exercise } from '../../generated/prisma/client/client.js';

export interface ExerciseRepository {
  create(data: {
    name: string;
    muscle_group: string;
    media_url?: string | null;
  }): Promise<Exercise>;

  findAll(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
}