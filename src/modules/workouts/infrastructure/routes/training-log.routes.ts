import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaTrainingLogRepository } from '../persistence/PrismaTrainingLogRepository.js';
import { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';
import { TrainingLogController } from '../controllers/training-log.controller.js';

const router = Router();

// Inicialización local aislada para evitar bloqueos por carga o dependencias circulares
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prismaInstance = new PrismaClient({ adapter });

const repository = new PrismaTrainingLogRepository(prismaInstance);
const createTrainingLogUseCase = new CreateTrainingLogUseCase(repository);
const getClientTrainingLogsUseCase = new GetClientTrainingLogsUseCase(repository);

const controller = new TrainingLogController(createTrainingLogUseCase, getClientTrainingLogsUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/client/:clientId', (req, res) => controller.getByClient(req, res));

export const trainingLogRoutes = router;