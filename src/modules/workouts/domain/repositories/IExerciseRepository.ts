import { Exercise } from '../entities/Exercise.js';

export interface ExerciseRepository {
  create(data: {
    name: string;
    muscle_group: string;
    media_url?: string | null;
  }): Promise<Exercise>; // Ahora es la entidad

  findAll(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
}