import type { TrainingLogRepository } from '../../domain/repositories/training-log.repository.js';
import type { Training_Log } from '../../generated/prisma/client/client.js';

export class GetClientTrainingLogsUseCase {
  constructor(private trainingLogRepository: TrainingLogRepository) {}

  async execute(clientId: string): Promise<Training_Log[]> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para obtener el historial.');
    }
    return this.trainingLogRepository.findByClientId(clientId);
  }
}