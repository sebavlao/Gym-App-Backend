import type { Request, Response } from 'express';
import { CreateMembershipUseCase } from '../../application/use-cases/CreateMembershipUseCase.js';
import { GetMembershipQrUseCase } from '../../application/use-cases/GetMembershipQrUseCase.js';
import { ValidateMembershipUseCase } from '../../application/use-cases/ValidateMembershipUseCase.js';

export class MembershipController {
  constructor(
    private createMembershipUseCase: CreateMembershipUseCase,
    private getMembershipQrUseCase: GetMembershipQrUseCase,
    private validateMembershipUseCase: ValidateMembershipUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { id, user_id, gym_id, coach_id, status } = req.body;

      if (!user_id || !gym_id) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: user_id y gym_id' });
      }

      await this.createMembershipUseCase.execute({
        id: id || crypto.randomUUID(),
        userId: user_id,
        gymId: gym_id,
        coachId: coach_id,
        status: status // Ahora sí compila perfecto
      });

      res.status(201).json({ message: 'Membresía creada o actualizada en el sistema.' });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al crear la membresía' });
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