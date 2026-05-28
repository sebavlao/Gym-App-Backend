import { Router } from 'express';
import { PrismaExerciseRepository } from '../persistence/prisma-exercise.repository.js';
import { GetExercisesUseCase } from '../../application/use-cases/exercises/get-exercises.use-case.js';
import { CreateExerciseUseCase } from '../../application/use-cases/exercises/create-exercise.use-case.js';
import { ExerciseController } from '../controllers/exercise.controller.js';

const router = Router();

const repository = new PrismaExerciseRepository();
const getExercisesUseCase = new GetExercisesUseCase(repository);
const createExerciseUseCase = new CreateExerciseUseCase(repository);

const controller = new ExerciseController(createExerciseUseCase, getExercisesUseCase);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));

export const exerciseRoutes = router;