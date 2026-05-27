import type { Request, Response } from 'express';
import type { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import type { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';

export class TrainingLogController {
  constructor(
    private createTrainingLogUseCase: CreateTrainingLogUseCase,
    private getClientTrainingLogsUseCase: GetClientTrainingLogsUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { client_id, routine_exercise_id, weight_used, actual_reps, calories_burned } = req.body;

      if (!client_id || !routine_exercise_id || weight_used === undefined || !actual_reps) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: client_id, routine_exercise_id, weight_used y actual_reps' });
      }

      const newLog = await this.createTrainingLogUseCase.execute({
        client_id,
        routine_exercise_id,
        weight_used: Number(weight_used),
        actual_reps: Number(actual_reps),
        calories_burned: calories_burned ? Number(calories_burned) : null,
      });

      res.status(201).json(newLog);
    } catch (error: any) {
      console.error('🔴 ERROR EN TRAINING LOG CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al registrar el entrenamiento' });
    }
  }

  async getByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      const logs = await this.getClientTrainingLogsUseCase.execute(clientId as string);
      res.status(200).json(logs);
    } catch (error: any) {
      console.error('🔴 ERROR EN TRAINING LOG CONTROLLER (GET_BY_CLIENT):', error);
      res.status(400).json({ error: error.message || 'Error al obtener el historial' });
    }
  }
}