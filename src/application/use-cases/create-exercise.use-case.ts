import type { ExerciseRepository } from '../../domain/repositories/exercise.repository.js';
import type { Exercise } from '../../generated/prisma/client/client.js';

interface CreateExerciseInput {
  name: string;
  muscle_group: string;
  media_url?: string;
}

export class CreateExerciseUseCase {
  constructor(private exerciseRepository: ExerciseRepository) {}

  async execute(input: CreateExerciseInput): Promise<Exercise> {
    return this.exerciseRepository.create(input);
  }
}