import type { Request, Response } from 'express';
import type { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case.js';
import type { GetClientRoutinesUseCase } from '../../application/use-cases/get-client-routines.use-case.js';

export class RoutineController {
  constructor(
    private createRoutineUseCase: CreateRoutineUseCase,
    private getClientRoutinesUseCase: GetClientRoutinesUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { client_id, coach_id, exercises } = req.body;

      if (!client_id || !coach_id || !exercises) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: client_id, coach_id y exercises' });
      }

      if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: 'El campo exercises debe ser un arreglo con al menos un ejercicio.' });
      }

      // 🔥 VALIDACIÓN CRÍTICA: Aseguramos que el profesor mande la dosificación de cada ejercicio
      for (const item of exercises) {
        if (!item.exercise_id || item.series === undefined || !item.repetitions || item.order === undefined) {
          return res.status(400).json({ 
            error: 'Cada ejercicio debe incluir obligatoriamente: exercise_id, series, repetitions y order.' 
          });
        }
      }

      const newRoutine = await this.createRoutineUseCase.execute({
        client_id,
        coach_id,
        exercises,
      });

      res.status(201).json(newRoutine);
    } catch (error: any) {
      console.error('🔴 ERROR EN ROUTINE CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al crear la rutina' });
    }
  }

  async getByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      const routines = await this.getClientRoutinesUseCase.execute(clientId as string);
      res.status(200).json(routines);
    } catch (error: any) {
      console.error('🔴 ERROR EN ROUTINE CONTROLLER (GET_BY_CLIENT):', error);
      res.status(400).json({ error: error.message || 'Error al obtener las rutinas' });
    }
  }
}