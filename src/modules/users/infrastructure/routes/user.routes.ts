import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaUserRepository } from '../persistence/PrismaUserRepository.js';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';
import { BcryptHasher } from '../../../../shared/infrastructure/cryptography/BcryptHasher.js';
import { UserController } from '../controllers/UserController.js';

const router = Router();

// Configuración correcta del adaptador (igual que en index.ts)
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const userRepository = new PrismaUserRepository(prisma);
const hasher = new BcryptHasher();
const registerUserUseCase = new RegisterUserUseCase(userRepository, hasher);
const controller = new UserController(registerUserUseCase);

router.post('/register', (req, res) => controller.register(req, res));

export default router;