import { Router } from 'express';
import { PrismaExerciseRepository } from '../persistence/prisma-exercise.repository.js';
import { GetExercisesUseCase } from '../../application/use-cases/exercises/get-exercises.use-case.js';
import { CreateExerciseUseCase } from '../../application/use-cases/exercises/create-exercise.use-case.js';
import { ExerciseController } from '../controllers/exercise.controller.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';
import { PrismaGymRoleRepository } from '../../../gyms/infrastructure/persistence/PrismaGymRoleRepository.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const repository = new PrismaExerciseRepository();
const gymRoleRepository = new PrismaGymRoleRepository(prisma);
const getExercisesUseCase = new GetExercisesUseCase(repository);
const createExerciseUseCase = new CreateExerciseUseCase(repository);

const controller = new ExerciseController(createExerciseUseCase, getExercisesUseCase, repository);

router.get('/', authenticate, resolveGymContext(gymRoleRepository), (req, res) => controller.getAll(req, res));
router.post('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.create(req, res));

export const exerciseRoutes = router;
