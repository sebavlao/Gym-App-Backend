import type { TrainingLogRepository } from '../../domain/repositories/ITrainingLogRepository.js';

interface CreateTrainingLogInput {
  client_id: string;
  routine_exercise_id: string;
  weight_used: number;
  actual_reps: number;
  calories_burned?: number | null;
}

export class CreateTrainingLogUseCase {
  constructor(private trainingLogRepository: TrainingLogRepository) {}

  // 🛠️ Cambiamos el retorno a Promise<any> para que acepte el mapeo del repositorio
  async execute(input: CreateTrainingLogInput): Promise<any> {
    if (!input.client_id || !input.routine_exercise_id) {
      throw new Error('Faltan datos clave: client_id o routine_exercise_id.');
    }

    if (input.weight_used < 0 || input.actual_reps <= 0) {
      throw new Error('El peso no puede ser negativo y las repeticiones deben ser mayores a cero.');
    }

    return this.trainingLogRepository.create(input);
  }
}