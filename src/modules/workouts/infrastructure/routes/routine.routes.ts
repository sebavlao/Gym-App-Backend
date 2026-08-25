import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaRoutineRepository } from '../persistence/PrismaRoutineRepository.js';
import { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case.js';
import { GetClientRoutinesUseCase } from '../../application/use-cases/get-client-routines.use-case.js';
import { RoutineController } from '../controllers/routine.controller.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';
import { PrismaGymRoleRepository } from '../../../gyms/infrastructure/persistence/PrismaGymRoleRepository.js';
import { PrismaMembershipRepository } from '../../../gyms/infrastructure/persistence/PrismaMembershipRepository.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const repository = new PrismaRoutineRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const createRoutineUseCase = new CreateRoutineUseCase(repository);
const getClientRoutinesUseCase = new GetClientRoutinesUseCase(repository);

const controller = new RoutineController(
  createRoutineUseCase,
  getClientRoutinesUseCase,
  gymRoleRepository,
  membershipRepository,
);

router.post('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.create(req, res));
router.get('/client/:clientId', authenticate, resolveGymContext(gymRoleRepository), (req, res) => controller.getByClient(req, res));

export const routineRoutes = router;
