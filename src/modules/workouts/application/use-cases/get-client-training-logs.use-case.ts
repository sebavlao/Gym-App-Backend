import { TrainingLog } from '../../domain/entities/TrainingLog.js';
import type { TrainingLogRepository } from '../../domain/repositories/ITrainingLogRepository.js';

export class GetClientTrainingLogsUseCase {
  constructor(private trainingLogRepository: TrainingLogRepository) {}

  async execute(clientId: string): Promise<TrainingLog[]> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para obtener el historial.');
    }
    
    return this.trainingLogRepository.findByClientId(clientId);
  }
}