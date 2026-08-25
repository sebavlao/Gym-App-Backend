import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaTrainingLogRepository } from '../persistence/PrismaTrainingLogRepository.js';
import { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';
import { TrainingLogController } from '../controllers/training-log.controller.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';
import { PrismaGymRoleRepository } from '../../../gyms/infrastructure/persistence/PrismaGymRoleRepository.js';
import { PrismaMembershipRepository } from '../../../gyms/infrastructure/persistence/PrismaMembershipRepository.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const repository = new PrismaTrainingLogRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const createTrainingLogUseCase = new CreateTrainingLogUseCase(repository);
const getClientTrainingLogsUseCase = new GetClientTrainingLogsUseCase(repository);

const controller = new TrainingLogController(
  createTrainingLogUseCase,
  getClientTrainingLogsUseCase,
  gymRoleRepository,
  membershipRepository,
);

router.post('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH', 'CLIENT'), (req, res) => controller.create(req, res));
router.get('/client/:clientId', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH', 'CLIENT'), (req, res) => controller.getByClient(req, res));

export const trainingLogRoutes = router;
