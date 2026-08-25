import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMembershipFeeRepository } from '../persistence/PrismaMembershipFeeRepository.js';
import { PrismaMembershipRepository } from '../persistence/PrismaMembershipRepository.js';
import { PrismaGymRoleRepository } from '../persistence/PrismaGymRoleRepository.js';
import { GenerateMembershipFeesUseCase } from '../../application/use-cases/GenerateMembershipFeesUseCase.js';
import { ListMembershipFeesUseCase } from '../../application/use-cases/ListMembershipFeesUseCase.js';
import { GetUserMembershipFeesUseCase } from '../../application/use-cases/GetUserMembershipFeesUseCase.js';
import { MembershipFeeController } from '../controllers/MembershipFeeController.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const feeRepository = new PrismaMembershipFeeRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);

const generateFeesUseCase = new GenerateMembershipFeesUseCase(feeRepository, membershipRepository);
const listFeesUseCase = new ListMembershipFeesUseCase(feeRepository);
const getUserFeesUseCase = new GetUserMembershipFeesUseCase(feeRepository);

const controller = new MembershipFeeController(generateFeesUseCase, listFeesUseCase, getUserFeesUseCase);

// Generar cuotas (solo GYM_ADMIN)
router.post('/generate', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.generate(req, res));

// Listar cuotas del gimnasio (solo GYM_ADMIN, con filtros)
router.get('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.list(req, res));

// Actualizar estado de cuota (solo GYM_ADMIN)
router.patch('/:feeId/status', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.updateStatus(req, res));

// Mis cuotas (cualquier usuario autenticado, gimnasio-scoped)
router.get('/me', authenticate, resolveGymContext(gymRoleRepository), (req, res) => controller.me(req, res));

export default router;
