import type { Request, Response } from 'express';
import { ActivateMembershipByPaymentUseCase } from '../../application/use-cases/ActivateMembershipByPaymentUseCase.js';

export class WebhookController {
  constructor(private activateMembershipUseCase: ActivateMembershipByPaymentUseCase) {}

  async handle(req: Request, res: Response) {
    try {
      // MercadoPago suele enviar el userId en el campo 'external_reference' o 'metadata'
      // Vamos a asumir que viene en el body.
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'Falta el user_id en la notificación de pago.' });
      }

      console.log(`🔔 Recibiendo pago para el usuario: ${user_id}`);

      const result = await this.activateMembershipUseCase.execute(user_id);

      if (!result.success) {
        return res.status(404).json({ error: result.message });
      }

      return res.status(200).json({ message: 'Pago procesado, membresía activada.' });
    } catch (error: any) {
      console.error('🔴 ERROR EN WEBHOOK:', error);
      return res.status(500).json({ error: 'Error interno al procesar el webhook.' });
    }
  }
}