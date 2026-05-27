import { Router } from 'express';
import { PrismaExerciseRepository } from '../repositories/prisma-exercise.repository.js';
import { GetExercisesUseCase } from '../../application/use-cases/get-exercises.use-case.js';
import { CreateExerciseUseCase } from '../../application/use-cases/create-exercise.use-case.js';
import { ExerciseController } from '../controllers/exercise.controller.js';

const router = Router();

// Inyección de dependencias
const repository = new PrismaExerciseRepository();
const getExercisesUseCase = new GetExercisesUseCase(repository);
const createExerciseUseCase = new CreateExerciseUseCase(repository);

// Le pasamos ambos casos de uso al controlador
const controller = new ExerciseController(createExerciseUseCase, getExercisesUseCase);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res)); // <-- REGISTRAMOS EL POST

export const exerciseRoutes = router;