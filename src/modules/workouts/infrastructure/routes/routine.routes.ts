import { Router } from 'express';
import { PrismaRoutineRepository } from '../persistence/PrismaRoutineRepository.js';
// Cambiados a .js al final:
import { CreateRoutineUseCase } from '../../application/use-cases/create-routine.use-case.js';
import { GetClientRoutinesUseCase } from '../../application/use-cases/get-client-routines.use-case.js';
import { RoutineController } from '../controllers/routine.controller.js';

const router = Router();

const repository = new PrismaRoutineRepository();
const createRoutineUseCase = new CreateRoutineUseCase(repository);
const getClientRoutinesUseCase = new GetClientRoutinesUseCase(repository);

const controller = new RoutineController(createRoutineUseCase, getClientRoutinesUseCase);

router.post('/', (req, res) => controller.create(req, res));

// FIX AQUÍ: Cambiamos :client_id por :clientId para que machee con el controlador
router.get('/client/:clientId', (req, res) => controller.getByClient(req, res));

export const routineRoutes = router;