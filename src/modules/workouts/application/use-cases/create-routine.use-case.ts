import type { RoutineRepository } from '../../domain/repositories/IRoutineRepository.js';
import type { Routine } from '../../../../generated/prisma/client/client.js';

interface CreateRoutineInput {
  client_id: string;
  coach_id: string;
  exercises: { exercise_id: string }[];
}

export class CreateRoutineUseCase {
  constructor(private routineRepository: RoutineRepository) {}

  async execute(input: CreateRoutineInput): Promise<Routine> {
    if (!input.client_id || !input.coach_id) {
      throw new Error('Faltan los identificadores del cliente o del coach.');
    }

    if (!input.exercises || input.exercises.length === 0) {
      throw new Error('La rutina debe contener al menos un ejercicio.');
    }

    return this.routineRepository.create(input);
  }
}