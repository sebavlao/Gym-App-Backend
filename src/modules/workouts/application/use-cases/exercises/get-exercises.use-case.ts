import type { ExerciseRepository } from '../../../domain/repositories/IExerciseRepository.js';
import type { Exercise } from '../../../domain/entities/Exercise.js';

export class GetExercisesUseCase {
  constructor(private exerciseRepository: ExerciseRepository) {}

  async execute(): Promise<Exercise[]> {
    return this.exerciseRepository.findAll();
  }
}
