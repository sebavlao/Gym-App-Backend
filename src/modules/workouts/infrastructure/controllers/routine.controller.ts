import type { Request, Response } from 'express';
import type { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case.js';
import type { GetClientRoutinesUseCase } from '../../application/use-cases/get-client-routines.use-case.js';
import type { IGymRoleRepository } from '../../../gyms/domain/repositories/IGymRoleRepository.js';
import type { IMembershipRepository } from '../../../gyms/domain/repositories/IMembershipRepository.js';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';

export class RoutineController {
  constructor(
    private createRoutineUseCase: CreateRoutineUseCase,
    private getClientRoutinesUseCase: GetClientRoutinesUseCase,
    private gymRoleRepository: IGymRoleRepository,
    private membershipRepository: IMembershipRepository,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const actorUserId = scopedReq.userId;
      const { client_id, coach_id, title, description, end_date, days } = req.body;

      if (!client_id || !title || !days) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: client_id, title y days son requeridos.' });
      }

      if (!Array.isArray(days) || days.length === 0) {
        return res.status(400).json({ error: 'El campo days debe ser un arreglo con al menos un bloque de día de entrenamiento.' });
      }

      const clientRoles = await this.gymRoleRepository.findRolesByUserAndGym(client_id, gymId);
      if (!clientRoles.includes('CLIENT')) {
        return res.status(403).json({ error: 'El cliente no pertenece a este gimnasio' });
      }

      if (actorRoles.includes('COACH')) {
        const memberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
        const isAssigned = memberships.some(m => m.userId === client_id);
        if (!isAssigned) {
          return res.status(403).json({ error: 'No tienes alumnos asignados con ese ID en este gimnasio' });
        }
      }

      for (const day of days) {
        if (!day.name || day.order === undefined || !Array.isArray(day.exercises) || day.exercises.length === 0) {
          return res.status(400).json({ error: 'Cada bloque de día debe incluir: name, order y exercises.' });
        }

        for (const item of day.exercises) {
          if (!item.exerciseId || item.series === undefined || !item.repetitions || item.order === undefined) {
            return res.status(400).json({ 
              error: 'Cada ejercicio dentro del día debe incluir: exerciseId, series, repetitions y order.' 
            });
          }
        }
      }

      await this.createRoutineUseCase.execute({
        client_id,
        coach_id: actorUserId,
        title,
        description,
        end_date,
        days,
      });

      return res.status(201).json({ message: 'Rutina de entrenamiento creada y asignada con éxito al alumno.' });
    } catch (error: any) {
      console.error('🔴 ERROR EN ROUTINE CONTROLLER (CREATE):', error);
      return res.status(400).json({ error: error.message || 'Error al crear la rutina' });
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
        return res.status(403).json({ error: 'No puedes consultar rutinas de otro usuario' });
      }

      if (actorRoles.includes('COACH')) {
        const memberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
        const isAssigned = memberships.some(m => m.userId === clientId);
        if (!isAssigned) {
          return res.status(403).json({ error: 'No tienes acceso a las rutinas de ese alumno' });
        }
      }

      const routines = await this.getClientRoutinesUseCase.execute(clientId as string);
      return res.status(200).json(routines);
    } catch (error: any) {
      console.error('🔴 ERROR EN ROUTINE CONTROLLER (GET_BY_CLIENT):', error);
      return res.status(400).json({ error: error.message || 'Error al obtener las rutinas' });
    }
  }
}
