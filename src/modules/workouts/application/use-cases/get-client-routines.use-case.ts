import type { RoutineRepository } from '../../domain/repositories/IRoutineRepository.js';

export class GetClientRoutinesUseCase {
  constructor(private routineRepository: RoutineRepository) {}

  async execute(clientId: string): Promise<any> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para buscar sus rutinas.');
    }
    return this.routineRepository.findByClientId(clientId);
  }
}