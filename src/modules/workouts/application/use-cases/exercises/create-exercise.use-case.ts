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

  async execute(input: CreateExerciseInput) {
    // 1. Creamos la entidad (validada)
    const exercise = Exercise.create({
      id: randomUUID(),
      name: input.name,
      muscleGroup: input.muscle_group, // Mapeo de snake a camel
      mediaUrl: input.media_url ?? null
    });

    // 2. Pasamos la entidad completa al repositorio
    return await this.exerciseRepository.create(exercise);
  }
}