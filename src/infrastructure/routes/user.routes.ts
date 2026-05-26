import { Router } from 'express';
import { PrismaUserRepository } from '../repositories/prisma-user.repository.js';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

const repository = new PrismaUserRepository();
const registerUseCase = new RegisterUserUseCase(repository);
const controller = new UserController(registerUseCase);

router.post('/register', (req, res) => controller.register(req, res));

export const userRoutes = router;