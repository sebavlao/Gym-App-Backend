import { Router } from 'express';
import { PrismaTrainingLogRepository } from '../persistence/PrismaTrainingLogRepository.js';
import { CreateTrainingLogUseCase } from '../../application/use-cases/create-training-log.use-case.js';
import { GetClientTrainingLogsUseCase } from '../../application/use-cases/get-client-training-logs.use-case.js';
import { TrainingLogController } from '../controllers/training-log.controller.js';
// Controlá que tenga los 4 saltos exactos y las carpetas correctas:
import { prisma } from '../../../../shared/infrastructure/persistence/prisma.js';

const router = Router();

const repository = new PrismaTrainingLogRepository(prisma);
const createTrainingLogUseCase = new CreateTrainingLogUseCase(repository);
const getClientTrainingLogsUseCase = new GetClientTrainingLogsUseCase(repository);

const controller = new TrainingLogController(createTrainingLogUseCase, getClientTrainingLogsUseCase);

router.post('/', (req, res) => controller.create(req, res));

// CAMBIO AQUÍ: Cambiamos :client_id por :clientId para que machee con el controlador
router.get('/client/:clientId', (req, res) => controller.getByClient(req, res));

export const trainingLogRoutes = router;