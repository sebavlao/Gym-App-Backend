import type { Request, Response } from 'express';
import { CreateMembershipUseCase } from '../../application/use-cases/CreateMembershipUseCase.js';
import { GetMembershipQrUseCase } from '../../application/use-cases/GetMembershipQrUseCase.js';
import { ValidateMembershipUseCase } from '../../application/use-cases/ValidateMembershipUseCase.js';
import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import type { IGymRoleRepository } from '../../domain/repositories/IGymRoleRepository.js';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';

export class MembershipController {
  constructor(
    private createMembershipUseCase: CreateMembershipUseCase,
    private getMembershipQrUseCase: GetMembershipQrUseCase,
    private validateMembershipUseCase: ValidateMembershipUseCase,
    private membershipRepository: IMembershipRepository,
    private gymRoleRepository: IGymRoleRepository,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { user_id, coach_id, status } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'Falta el campo obligatorio: user_id' });
      }

      if (req.body.gym_id && req.body.gym_id !== gymId) {
        return res.status(400).json({ error: 'El gym_id del body no coincide con el contexto activo' });
      }

      await this.createMembershipUseCase.execute({
        id: crypto.randomUUID(),
        userId: user_id,
        gymId,
        coachId: coach_id,
        status
      });

      const existingRoles = await this.gymRoleRepository.findRolesByUserAndGym(user_id, gymId);
      if (!existingRoles.includes('CLIENT')) {
        await this.gymRoleRepository.create(user_id, gymId, 'CLIENT');
      }

      res.status(201).json({ message: 'Membresía creada o actualizada en el sistema.' });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al crear la membresía' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorRoles = scopedReq.gymContext.gymRoles;
      const actorUserId = scopedReq.userId;

      let memberships;

      if (actorRoles.includes('GYM_ADMIN')) {
        memberships = await this.membershipRepository.findByGymId(gymId);
      } else if (actorRoles.includes('COACH')) {
        memberships = await this.membershipRepository.findByGymIdAndCoachId(gymId, actorUserId);
      } else {
        return res.status(403).json({ error: 'Rol insuficiente para listar membresías' });
      }

      res.status(200).json(memberships);
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP CONTROLLER (LIST):', error);
      res.status(500).json({ error: error.message || 'Error al listar membresías' });
    }
  }

  async getQr(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Falta el ID de la membresía' });
      }

      const qrBase64 = await this.getMembershipQrUseCase.execute(id as string);
      res.status(200).json({ qr: qrBase64 });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP CONTROLLER (GET_QR):', error);
      res.status(400).json({ error: error.message || 'Error al generar el código QR' });
    }
  }

  async validate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Falta el ID de la membresía para validar' });
      }

      const result = await this.validateMembershipUseCase.execute(id as string);
      
      if (!result.accessGranted) {
        return res.status(403).json({
          accessGranted: result.accessGranted,
          message: result.message
        });
      }

      res.status(200).json({
        accessGranted: result.accessGranted,
        message: result.message
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP CONTROLLER (VALIDATE):', error);
      res.status(400).json({ error: error.message || 'Error al validar la membresía' });
    }
  }
}
