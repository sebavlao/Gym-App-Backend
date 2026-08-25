import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaUserRepository } from '../../../users/infrastructure/persistence/PrismaUserRepository.js';
import { PrismaMembershipRepository } from '../persistence/PrismaMembershipRepository.js';
import { PrismaGymRoleRepository } from '../persistence/PrismaGymRoleRepository.js';
import { ListGymUsersUseCase } from '../../application/use-cases/gym-users/ListGymUsersUseCase.js';
import { CreateGymUserUseCase } from '../../application/use-cases/gym-users/CreateGymUserUseCase.js';
import { GymUsersController } from '../controllers/GymUsersController.js';
import { BcryptHasher } from '../../../../shared/infrastructure/cryptography/BcryptHasher.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const userRepository = new PrismaUserRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);
const hasher = new BcryptHasher();

const listGymUsersUseCase = new ListGymUsersUseCase(userRepository, gymRoleRepository, membershipRepository);
const createGymUserUseCase = new CreateGymUserUseCase(
  userRepository,
  membershipRepository,
  gymRoleRepository,
  hasher,
);

const controller = new GymUsersController(listGymUsersUseCase, createGymUserUseCase);

router.use(authenticate);
router.use(resolveGymContext(gymRoleRepository));

// Listar clientes: GYM_ADMIN (todos) y COACH (solo asignados)
router.get('/clients', requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.listClients(req, res));

// Listar coaches: solo GYM_ADMIN
router.get('/coaches', requireGymRole('GYM_ADMIN'), (req, res) => controller.listCoaches(req, res));

// Crear cliente: solo GYM_ADMIN
router.post('/clients', requireGymRole('GYM_ADMIN'), (req, res) => controller.createClient(req, res));

// Crear coach: solo GYM_ADMIN
router.post('/coaches', requireGymRole('GYM_ADMIN'), (req, res) => controller.createCoach(req, res));

export default router;
