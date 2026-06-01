import { Routine } from '../../domain/entities/Routine.js';
import type { RoutineRepository } from '../../domain/repositories/IRoutineRepository.js';

export class GetClientRoutinesUseCase {
  constructor(private routineRepository: RoutineRepository) {}

  async execute(clientId: string): Promise<Routine[]> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para buscar sus rutinas.');
    }
    
    // El repositorio ya hace el mapping interno a la entidad de dominio
    return this.routineRepository.findByClientId(clientId);
  }
}