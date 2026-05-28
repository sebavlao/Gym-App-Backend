import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaMembershipRepository } from '../persistence/PrismaMembershipRepository.js';
import { CreateMembershipUseCase } from '../../application/use-cases/CreateMembershipUseCase.js';
import { GetMembershipQrUseCase } from '../../application/use-cases/GetMembershipQrUseCase.js';
import { ValidateMembershipUseCase } from '../../application/use-cases/ValidateMembershipUseCase.js';
import { MembershipController } from '../controllers/MembershipController.js';

const router = Router();

// Configuración correcta del cliente con el adaptador de Postgres
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const repository = new PrismaMembershipRepository(prisma);

const createMembershipUseCase = new CreateMembershipUseCase(repository);
const getMembershipQrUseCase = new GetMembershipQrUseCase(repository);
const validateMembershipUseCase = new ValidateMembershipUseCase(repository);

const controller = new MembershipController(
  createMembershipUseCase,
  getMembershipQrUseCase,
  validateMembershipUseCase
);

router.post('/', (req, res) => controller.create(req, res));
router.get('/:id/qr', (req, res) => controller.getQr(req, res));
router.post('/:id/validate', (req, res) => controller.validate(req, res));

export default router;