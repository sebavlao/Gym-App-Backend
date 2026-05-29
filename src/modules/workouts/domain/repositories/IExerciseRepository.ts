import { Exercise } from '../entities/Exercise.js';

export interface ExerciseRepository {
  // El repositorio ahora acepta la Entidad completa
  create(exercise: Exercise): Promise<Exercise>; 
  findAll(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
}