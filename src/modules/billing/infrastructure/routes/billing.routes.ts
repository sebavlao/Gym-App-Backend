import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaMembershipRepository } from '../../../gyms/infrastructure/persistence/PrismaMembershipRepository.js';
import { ActivateMembershipByPaymentUseCase } from '../../application/use-cases/ActivateMembershipByPaymentUseCase.js';
import { WebhookController } from '../controllers/WebhookController.js';
import { BillingController } from '../controllers/BillingController.js';
import { CreatePaymentPreferenceUseCase } from '../../application/use-cases/CreatePaymentPreferenceUseCase.js';
import { authWebhook } from '../../../../shared/infrastructure/middleware/authWebhook.js';

const router = Router();
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const repository = new PrismaMembershipRepository(prisma);

const activateUseCase = new ActivateMembershipByPaymentUseCase(repository);
const controller = new WebhookController(activateUseCase);

const createPreferenceUseCase = new CreatePaymentPreferenceUseCase();
const billingController = new BillingController(createPreferenceUseCase);

// RUTA CORREGIDA: Ahora solo existe una vez y tiene el middleware (authWebhook) aplicado.
router.post('/webhook', authWebhook, (req, res) => controller.handle(req, res));

// Ruta para crear preferencia (esta no necesita authWebhook porque la llama el Front)
router.post('/create-preference', (req, res) => billingController.createPreference(req, res));

export default router;