import type { Request, Response } from 'express';
import type { CreateExerciseUseCase } from '../../application/use-cases/create-exercise.use-case.js';
import type { GetExercisesUseCase } from '../../application/use-cases/get-exercises.use-case.js';

export class ExerciseController {
  constructor(
    private createExerciseUseCase: CreateExerciseUseCase,
    private getExercisesUseCase: GetExercisesUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { name, muscle_group, media_url } = req.body;

      if (!name || !muscle_group) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: name y muscle_group' });
      }

      const newExercise = await this.createExerciseUseCase.execute({
        name,
        muscle_group,
        media_url
      });

      res.status(201).json(newExercise);
    } catch (error: any) {
      console.error('🔴 ERROR EN EXERCISE CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al crear el ejercicio' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const exercises = await this.getExercisesUseCase.execute();
      res.status(200).json(exercises);
    } catch (error: any) {
      console.error('🔴 ERROR EN EXERCISE CONTROLLER (GET_ALL):', error);
      res.status(400).json({ error: error.message || 'Error al obtener los ejercicios' });
    }
  }
}