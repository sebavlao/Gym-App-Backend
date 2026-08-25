import type { Request, Response } from 'express';
import type { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import type { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';
import type { IGymRoleRepository } from '../../../gyms/domain/repositories/IGymRoleRepository.js';
import type { IMembershipRepository } from '../../../gyms/domain/repositories/IMembershipRepository.js';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';

export class TrainingLogController {
  constructor(
    private createTrainingLogUseCase: CreateTrainingLogUseCase,
    private getClientTrainingLogsUseCase: GetClientTrainingLogsUseCase,
    private gymRoleRepository: IGymRoleRepository,
    private membershipRepository: IMembershipRepository,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const actorUserId = scopedReq.userId;
      const { client_id, routine_exercise_id, weight_used, actual_reps, calories_burned } = req.body;

      if (!client_id || !routine_exercise_id || weight_used === undefined || !actual_reps) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: client_id, routine_exercise_id, weight_used y actual_reps' });
      }

      const clientRoles = await this.gymRoleRepository.findRolesByUserAndGym(client_id, gymId);
      if (!clientRoles.includes('CLIENT')) {
        return res.status(403).json({ error: 'El cliente no pertenece a este gimnasio' });
      }

      if (actorRoles.includes('CLIENT') && client_id !== actorUserId) {
        return res.status(403).json({ error: 'Solo puedes registrar entrenamiento para ti mismo' });
      }

      if (actorRoles.includes('COACH')) {
        const memberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
        const isAssigned = memberships.some(m => m.userId === client_id);
        if (!isAssigned) {
          return res.status(403).json({ error: 'No puedes registrar entrenamiento para un alumno no asignado' });
        }
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
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const actorUserId = scopedReq.userId;
      const clientId = req.params.clientId as string;

      const clientRoles = await this.gymRoleRepository.findRolesByUserAndGym(clientId, gymId);
      if (!clientRoles.includes('CLIENT')) {
        return res.status(403).json({ error: 'El cliente no pertenece a este gimnasio' });
      }

      if (actorRoles.includes('CLIENT') && clientId !== actorUserId) {
        return res.status(403).json({ error: 'No puedes consultar registros de otro usuario' });
      }

      if (actorRoles.includes('COACH')) {
        const memberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
        const isAssigned = memberships.some(m => m.userId === clientId);
        if (!isAssigned) {
          return res.status(403).json({ error: 'No tienes acceso a los registros de ese alumno' });
        }
      }

      const logs = await this.getClientTrainingLogsUseCase.execute(clientId as string);
      res.status(200).json(logs);
    } catch (error: any) {
      console.error('🔴 ERROR EN TRAINING LOG CONTROLLER (GET_BY_CLIENT):', error);
      res.status(400).json({ error: error.message || 'Error al obtener el historial' });
    }
  }
}
