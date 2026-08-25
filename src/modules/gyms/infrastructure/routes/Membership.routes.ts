import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaMembershipRepository } from '../persistence/PrismaMembershipRepository.js';
import { PrismaGymRoleRepository } from '../persistence/PrismaGymRoleRepository.js';
import { CreateMembershipUseCase } from '../../application/use-cases/CreateMembershipUseCase.js';
import { GetMembershipQrUseCase } from '../../application/use-cases/GetMembershipQrUseCase.js';
import { ValidateMembershipUseCase } from '../../application/use-cases/ValidateMembershipUseCase.js';
import { UpdateMembershipCoachUseCase } from '../../application/use-cases/UpdateMembershipCoachUseCase.js';
import { UpdateMembershipStatusUseCase } from '../../application/use-cases/UpdateMembershipStatusUseCase.js';
import { MembershipController } from '../controllers/MembershipController.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const repository = new PrismaMembershipRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);

const createMembershipUseCase = new CreateMembershipUseCase(repository);
const getMembershipQrUseCase = new GetMembershipQrUseCase(repository);
const validateMembershipUseCase = new ValidateMembershipUseCase(repository);
const updateMembershipCoachUseCase = new UpdateMembershipCoachUseCase(repository, gymRoleRepository);
const updateMembershipStatusUseCase = new UpdateMembershipStatusUseCase(repository);

const controller = new MembershipController(
  createMembershipUseCase,
  getMembershipQrUseCase,
  validateMembershipUseCase,
  updateMembershipCoachUseCase,
  updateMembershipStatusUseCase,
  repository,
  gymRoleRepository,
);

router.post('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.create(req, res));
router.get('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.list(req, res));
router.patch('/:id/coach', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.updateCoach(req, res));
router.patch('/:id/status', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN'), (req, res) => controller.updateStatus(req, res));
router.get('/:id/qr', (_req, res) => {
  res.status(501).json({
    error: 'Generación de QR no disponible temporalmente. El QR dinámico se implementará en una fase posterior.',
  });
});
router.post('/:id/validate', (_req, res) => {
  res.status(501).json({
    error: 'Validación de membresía no disponible temporalmente. El flujo seguro de asistencia se implementará en una fase posterior.',
  });
});

export default router;
