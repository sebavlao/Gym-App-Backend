import type { RoutineRepository, RoutineWithExercises } from '../../domain/repositories/routine.repository.js';

export class GetClientRoutinesUseCase {
  constructor(private routineRepository: RoutineRepository) {}

  async execute(clientId: string): Promise<RoutineWithExercises[]> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para buscar sus rutinas.');
    }
    return this.routineRepository.findByClientId(clientId);
  }
}