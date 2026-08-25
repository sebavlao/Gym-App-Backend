import type { Request, Response } from 'express';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { CheckInUseCase } from '../../application/use-cases/CheckInUseCase.js';
import { ListAttendanceUseCase } from '../../application/use-cases/ListAttendanceUseCase.js';
import { GetUserAttendanceUseCase } from '../../application/use-cases/GetUserAttendanceUseCase.js';
import { AttendanceSource } from '../../../../generated/prisma/client/client.js';

export class AttendanceController {
  constructor(
    private checkInUseCase: CheckInUseCase,
    private listAttendanceUseCase: ListAttendanceUseCase,
    private getUserAttendanceUseCase: GetUserAttendanceUseCase,
    private membershipRepository: IMembershipRepository,
  ) {}

  async checkIn(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorUserId = scopedReq.userId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const { user_id, source } = req.body;

      // CLIENT no puede hacer check-in
      if (actorRoles.includes('CLIENT')) {
        return res.status(403).json({ 
          error: 'Los clientes no pueden registrar asistencia' 
        });
      }

      if (!user_id) {
        return res.status(400).json({ 
          error: 'Se requiere el campo user_id para registrar la asistencia de un alumno' 
        });
      }

      // COACH solo puede registrar asistencia de alumnos asignados a él
      if (actorRoles.includes('COACH') && !actorRoles.includes('GYM_ADMIN')) {
        const assignedMemberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
        const isAssigned = assignedMemberships.some(m => m.userId === user_id);
        if (!isAssigned) {
          return res.status(403).json({ 
            error: 'No tienes permisos para registrar asistencia de este alumno (no está asignado a tu grupo)' 
          });
        }
      }

      const attendance = await this.checkInUseCase.execute({
        gymId,
        userId: user_id,
        recordedByUserId: actorUserId !== user_id ? actorUserId : undefined,
        source: source as AttendanceSource || AttendanceSource.MANUAL,
      });

      res.status(201).json({ 
        message: 'Check-in registrado con éxito',
        attendance,
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN ATTENDANCE CONTROLLER (CHECK IN):', error);
      res.status(400).json({ error: error.message || 'Error al registrar el check-in' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorUserId = scopedReq.userId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const { from, to, client_id } = req.query;

      const attendances = await this.listAttendanceUseCase.execute({
        gymId,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        clientId: client_id as string | undefined,
        actorUserId,
        actorRoles,
      });

      res.status(200).json(attendances);
    } catch (error: any) {
      console.error('🔴 ERROR EN ATTENDANCE CONTROLLER (LIST):', error);
      res.status(500).json({ error: error.message || 'Error al listar la asistencia' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const userId = scopedReq.userId;

      const attendances = await this.getUserAttendanceUseCase.execute({ userId, gymId });

      res.status(200).json(attendances);
    } catch (error: any) {
      console.error('🔴 ERROR EN ATTENDANCE CONTROLLER (ME):', error);
      res.status(500).json({ error: error.message || 'Error al obtener la asistencia del usuario' });
    }
  }
}
