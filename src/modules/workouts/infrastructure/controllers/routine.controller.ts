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
      const { client_id, coach_id, title, description, end_date, days } = req.body;

      if (!client_id || !coach_id || !title || !days) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: client_id, coach_id, title y days son requeridos.' });
      }

      if (!Array.isArray(days) || days.length === 0) {
        return res.status(400).json({ error: 'El campo days debe ser un arreglo con al menos un bloque de día de entrenamiento.' });
      }

      // Validación rigurosa de la estructura anidada en runtime
      for (const day of days) {
        if (!day.name || day.order === undefined || !Array.isArray(day.exercises) || day.exercises.length === 0) {
          return res.status(400).json({ error: 'Cada bloque de día debe incluir obligatoriamente: name, order y un arreglo exercises con contenido.' });
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
        coach_id,
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
      const { clientId } = req.params;

      const routines = await this.getClientRoutinesUseCase.execute(clientId as string);
      return res.status(200).json(routines);
    } catch (error: any) {
      console.error('🔴 ERROR EN ROUTINE CONTROLLER (GET_BY_CLIENT):', error);
      return res.status(400).json({ error: error.message || 'Error al obtener las rutinas' });
    }
  }
}