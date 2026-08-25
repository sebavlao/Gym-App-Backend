import { Routine } from '../entities/Routine.js';

export interface RoutineRepository {
  // El repositorio ahora acepta la Entidad completa (que ya tiene los días y ejercicios validados adentro)
  save(routine: Routine): Promise<void>;
  
  // Métodos de lectura limpios, devolviendo la Entidad o null
  findById(id: string): Promise<Routine | null>;
  findByClientId(clientId: string): Promise<Routine[]>;
  
  // Borrado en cascada
  delete(id: string): Promise<void>;
}