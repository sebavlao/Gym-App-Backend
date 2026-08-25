import type { Request, Response } from 'express';
import { CreateGymUseCase } from '../../application/use-cases/create-gym.use-case.js';
import { GetGymsUseCase } from '../../application/use-cases/get-gyms.use-case.js';

export class GymController {
  constructor(
    private createGymUseCase: CreateGymUseCase,
    private getGymsUseCase: GetGymsUseCase // Inyectamos el nuevo caso de uso
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { name, address } = req.body;
      if (!name || !address) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: name y address' });
      }
      const newGym = await this.createGymUseCase.execute({ name, address });
      res.status(201).json(newGym);
    } catch (error: any) {
      console.error('🔴 ERROR EN GYM CONTROLLER (POST):', error);
      res.status(400).json({ error: error.message || 'Error al crear el gimnasio' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const gyms = await this.getGymsUseCase.execute();
      res.json(gyms);
    } catch (error: any) {
      console.error('🔴 ERROR EN GYM CONTROLLER (GET):', error);
      res.status(500).json({ error: 'Error al obtener los gimnasios' });
    }
  }
}