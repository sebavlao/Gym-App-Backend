import { Router } from 'express';
import { PrismaTrainingLogRepository } from '../repositories/prisma-training-log.repository.js';
import { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';
import { TrainingLogController } from '../controllers/training-log.controller.js';

const router = Router();

const repository = new PrismaTrainingLogRepository();
const createTrainingLogUseCase = new CreateTrainingLogUseCase(repository);
const getClientTrainingLogsUseCase = new GetClientTrainingLogsUseCase(repository);

const controller = new TrainingLogController(createTrainingLogUseCase, getClientTrainingLogsUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/client/:clientId', (req, res) => controller.getByClient(req, res));

export const trainingLogRoutes = router;