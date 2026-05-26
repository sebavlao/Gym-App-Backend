import type { Request, Response } from 'express';
import { GetExercisesUseCase } from '../../application/use-cases/get-exercises.use-case.js';
import { CreateExerciseUseCase } from '../../application/use-cases/create-exercise.use-case.js';

export class ExerciseController {
  constructor(
    private getExercisesUseCase: GetExercisesUseCase,
    private createExerciseUseCase: CreateExerciseUseCase // Inyectamos el nuevo caso de uso
  ) {}

  async getAll(req: Request, res: Response) {
    try {
      const exercises = await this.getExercisesUseCase.execute();
      res.json(exercises);
    } catch (error) {
      console.error('🔴 ERROR REAL EN EL CONTROLADOR (GET):', error);
      res.status(500).json({ error: 'Error al obtener los ejercicios' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, muscle_group, media_url } = req.body;

      // Validación rápida de campos obligatorios
      if (!name || !muscle_group) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: name y muscle_group' });
      }

      const newExercise = await this.createExerciseUseCase.execute({ name, muscle_group, media_url });
      res.status(201).json(newExercise);
    } catch (error) {
      console.error('🔴 ERROR REAL EN EL CONTROLADOR (POST):', error);
      res.status(500).json({ error: 'Error al crear el ejercicio' });
    }
  }
}