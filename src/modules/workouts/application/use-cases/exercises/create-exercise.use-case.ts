import type { ExerciseRepository } from '../../../domain/repositories/IExerciseRepository.js';
import { Exercise } from '../../../domain/entities/Exercise.js';
import { randomUUID } from 'crypto';

interface CreateExerciseInput {
  name: string;
  muscle_group: string;
  media_url?: string;
}

export class CreateExerciseUseCase {
  constructor(private exerciseRepository: ExerciseRepository) {}

  async execute(input: CreateExerciseInput, gymId?: string) {
    const exercise = Exercise.create({
      id: randomUUID(),
      name: input.name,
      muscleGroup: input.muscle_group,
      mediaUrl: input.media_url ?? null
    });

    return await this.exerciseRepository.create(exercise, gymId);
  }
}
