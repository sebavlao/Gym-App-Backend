import type { TrainingLogRepository } from '../../domain/repositories/ITrainingLogRepository.js';

export class GetClientTrainingLogsUseCase {
  constructor(private trainingLogRepository: TrainingLogRepository) {}

  // 🛠️ Cambiamos el retorno a Promise<any[]> para acoplarse a la respuesta del repositorio
  async execute(clientId: string): Promise<any[]> {
    if (!clientId) {
      throw new Error('Falta el ID del cliente para obtener el historial.');
    }
    return this.trainingLogRepository.findByClientId(clientId);
  }
}