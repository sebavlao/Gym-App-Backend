import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaUserRepository } from '../persistence/PrismaUserRepository.js';
import { PrismaGymRoleRepository } from '../../../gyms/infrastructure/persistence/PrismaGymRoleRepository.js';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../../application/use-cases/users/GetUserProfileUseCase.js';
import { GetUserGymsUseCase } from '../../application/use-cases/users/GetUserGymsUseCase.js';
import { BcryptHasher } from '../../../../shared/infrastructure/cryptography/BcryptHasher.js';
import { JwtTokenService } from '../../../../shared/infrastructure/auth/JwtTokenService.js';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const userRepository = new PrismaUserRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);
const hasher = new BcryptHasher();
const tokenService = new JwtTokenService();

const registerUserUseCase = new RegisterUserUseCase(userRepository, hasher);
const loginUserUseCase = new LoginUserUseCase(userRepository, hasher, tokenService);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const getUserGymsUseCase = new GetUserGymsUseCase(gymRoleRepository);

const controller = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  getUserProfileUseCase,
  getUserGymsUseCase,
  userRepository,
);

// Públicas
router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));

// Protegidas
router.get('/me', authenticate, (req, res) => controller.me(req, res));
router.get('/me/gyms', authenticate, (req, res) => controller.meGyms(req, res));
router.post('/change-password', authenticate, (req, res) => controller.changePassword(req, res));

export default router;
