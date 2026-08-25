import type { Request, Response } from 'express';
import type { CreateExerciseUseCase } from '../../application/use-cases/exercises/create-exercise.use-case.js';
import type { GetExercisesUseCase } from '../../application/use-cases/exercises/get-exercises.use-case.js';
import type { ExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';

export class ExerciseController {
  constructor(
    private createExerciseUseCase: CreateExerciseUseCase,
    private getExercisesUseCase: GetExercisesUseCase,
    private exerciseRepository: ExerciseRepository,
  ) {}

  async create(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { name, muscle_group, media_url } = req.body;

      if (!name || !muscle_group) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: name y muscle_group' });
      }
      
      const newExercise = await this.createExerciseUseCase.execute({
        name,
        muscle_group, 
        media_url
      }, gymId);

      res.status(201).json(newExercise);
    } catch (error: any) {
      console.error('🔴 ERROR EN EXERCISE CONTROLLER (CREATE):', error);
      res.status(400).json({ error: error.message || 'Error al crear el ejercicio' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;

      const exercises = await this.exerciseRepository.findAllByGym(gymId);
      res.status(200).json(exercises);
    } catch (error: any) {
      console.error('🔴 ERROR EN EXERCISE CONTROLLER (GET_ALL):', error);
      res.status(400).json({ error: error.message || 'Error al obtener los ejercicios' });
    }
  }
}
