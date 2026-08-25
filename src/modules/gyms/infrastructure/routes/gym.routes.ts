import { Router } from 'express';
import { PrismaGymRepository } from '../../infrastructure/persistence/prisma-gym.repository.js';
import { CreateGymUseCase } from '../../application/use-cases/create-gym.use-case.js';
import { GetGymsUseCase } from '../../application/use-cases/get-gyms.use-case.js';
import { GymController } from '../../../../modules/gyms/infrastructure/controllers/gym.controller.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';

const router = Router();

const repository = new PrismaGymRepository();
const createGymUseCase = new CreateGymUseCase(repository);
const getGymsUseCase = new GetGymsUseCase(repository);

const controller = new GymController(createGymUseCase, getGymsUseCase);

router.post('/', authenticate, (_req, res) => {
  res.status(501).json({
    error: 'Creación de gimnasios no disponible temporalmente. Se requiere un proceso de onboarding seguro que aún no está implementado.',
  });
});
router.get('/', (req, res) => controller.getAll(req, res));

export const gymRoutes = router;
