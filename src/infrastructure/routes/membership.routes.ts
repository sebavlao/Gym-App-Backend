import { Router } from 'express';
import { PrismaMembershipRepository } from '../repositories/prisma-membership.repository.js';
import { CreateMembershipUseCase } from '../../application/use-cases/create-membership.use-case.js';
import { GetMembershipQrUseCase } from '../../application/use-cases/get-membership-qr.use-case.js';
import { ValidateMembershipUseCase } from '../../application/use-cases/validate-membership.use-case.js';
import { MembershipController } from '../controllers/membership.controller.js';

const router = Router();

const repository = new PrismaMembershipRepository();
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

export const membershipRoutes = router;