import { Exercise } from '../entities/Exercise.js';

export interface ExerciseRepository {
  create(exercise: Exercise, gymId?: string): Promise<Exercise>; 
  findAll(): Promise<Exercise[]>;
  findAllByGym(gymId: string): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
}
