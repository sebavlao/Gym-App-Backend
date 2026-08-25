import type { Request, Response } from 'express';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import type { AuthenticatedRequest } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { GenerateMembershipFeesUseCase } from '../../application/use-cases/GenerateMembershipFeesUseCase.js';
import { ListMembershipFeesUseCase } from '../../application/use-cases/ListMembershipFeesUseCase.js';
import { GetUserMembershipFeesUseCase } from '../../application/use-cases/GetUserMembershipFeesUseCase.js';

export class MembershipFeeController {
  constructor(
    private generateFeesUseCase: GenerateMembershipFeesUseCase,
    private listFeesUseCase: ListMembershipFeesUseCase,
    private getUserFeesUseCase: GetUserMembershipFeesUseCase,
  ) {}

  async generate(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { period, amount, currency, due_date } = req.body;

      if (!period || !amount) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: period y amount' 
        });
      }

      const result = await this.generateFeesUseCase.execute({
        gymId,
        period,
        amount,
        currency,
        dueDate: due_date ? new Date(due_date) : undefined,
      });

      res.status(201).json({ 
        message: `${result.created} cuotas generadas, ${result.skipped} saltadas (ya existían)`,
        created: result.created,
        skipped: result.skipped,
        fees: result.fees,
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP FEE CONTROLLER (GENERATE):', error);
      res.status(400).json({ error: error.message || 'Error al generar las cuotas' });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { period, status, client_id } = req.query;

      const fees = await this.listFeesUseCase.execute({
        gymId,
        period: period as string | undefined,
        status: status as any,
        clientId: client_id as string | undefined,
      });

      res.status(200).json(fees);
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP FEE CONTROLLER (LIST):', error);
      res.status(500).json({ error: error.message || 'Error al listar las cuotas' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const feeId = req.params.feeId as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Falta el campo status' });
      }

      const fee = await this.listFeesUseCase['feeRepository'].findById(feeId);

      if (!fee) {
        return res.status(404).json({ error: 'Cuota no encontrada' });
      }

      // Verificar que la cuota pertenece al gimnasio
      if (fee.userId) {
        const fees = await this.listFeesUseCase.execute({ gymId: scopedReq.gymContext.gymId });
        const gymFee = fees.find(f => f.id === feeId);
        if (!gymFee) {
          return res.status(404).json({ error: 'Cuota no encontrada en este gimnasio' });
        }
      }

      if (status === 'PAID') {
        fee.markAsPaid();
      } else if (status === 'PENDING') {
        fee.markAsPending();
      } else if (status === 'WAIVED') {
        fee.markAsWaived();
      } else {
        return res.status(400).json({ error: 'Status inválido. Valores permitidos: PAID, PENDING, WAIVED' });
      }

      await this.listFeesUseCase['feeRepository'].update(fee);

      res.status(200).json({ 
        message: 'Estado de cuota actualizado con éxito',
        fee,
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP FEE CONTROLLER (UPDATE STATUS):', error);
      res.status(400).json({ error: error.message || 'Error al actualizar el estado de la cuota' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const userId = scopedReq.userId;

      const fees = await this.getUserFeesUseCase.execute({ userId, gymId });

      res.status(200).json(fees);
    } catch (error: any) {
      console.error('🔴 ERROR EN MEMBERSHIP FEE CONTROLLER (ME):', error);
      res.status(500).json({ error: error.message || 'Error al obtener las cuotas del usuario' });
    }
  }
}
