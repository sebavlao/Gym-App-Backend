import type { ExerciseRepository } from '../../domain/repositories/exercise.repository.js';
import type { Exercise } from '../../generated/prisma/client/client.js';

export class GetExercisesUseCase {
  constructor(private exerciseRepository: ExerciseRepository) {}

  async execute(): Promise<Exercise[]> {
    return this.exerciseRepository.findAll();
  }
}