import { Router } from 'express';
import { PrismaGymRepository } from '../repositories/prisma-gym.repository.js';
import { CreateGymUseCase } from '../../application/use-cases/create-gym.use-case.js';
import { GetGymsUseCase } from '../../application/use-cases/get-gyms.use-case.js';
import { GymController } from '../controllers/gym.controller.js';

const router = Router();

const repository = new PrismaGymRepository();
const createGymUseCase = new CreateGymUseCase(repository);
const getGymsUseCase = new GetGymsUseCase(repository);

// Le pasamos ambos casos de uso al controlador
const controller = new GymController(createGymUseCase, getGymsUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.getAll(req, res)); // <-- REGISTRAMOS EL GET

export const gymRoutes = router;