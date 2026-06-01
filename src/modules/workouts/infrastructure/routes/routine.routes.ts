import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaRoutineRepository } from '../persistence/PrismaRoutineRepository.js';
import { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case.js';
import { GetClientRoutinesUseCase } from '../../application/use-cases/get-client-routines.use-case.js';
import { RoutineController } from '../controllers/routine.controller.js';

const router = Router();

// Inicialización local aislada para evitar bloqueos por dependencias circulares
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prismaInstance = new PrismaClient({ adapter });

// Inyectamos la instancia local al repositorio
const repository = new PrismaRoutineRepository(prismaInstance);
const createRoutineUseCase = new CreateRoutineUseCase(repository);
const getClientRoutinesUseCase = new GetClientRoutinesUseCase(repository);

const controller = new RoutineController(createRoutineUseCase, getClientRoutinesUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/client/:clientId', (req, res) => controller.getByClient(req, res));

export const routineRoutes = router;