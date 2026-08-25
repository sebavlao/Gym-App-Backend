import type { Request, Response } from 'express';
import { CreatePaymentPreferenceUseCase } from '../../application/use-cases/CreatePaymentPreferenceUseCase.js';

export class BillingController {
  constructor(private createPreferenceUseCase: CreatePaymentPreferenceUseCase) {}

  async createPreference(req: Request, res: Response) {
    try {
      const { user_id, amount } = req.body;

      if (!user_id || !amount) {
        return res.status(400).json({ error: 'Faltan datos para crear la preferencia.' });
      }

      const result = await this.createPreferenceUseCase.execute(user_id, amount);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error al crear preferencia.' });
    }
  }
}