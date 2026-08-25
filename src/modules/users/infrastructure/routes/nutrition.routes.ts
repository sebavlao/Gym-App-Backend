import { Router, type Request, type Response, type NextFunction } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ZodError, type ZodIssue } from 'zod';

import { PrismaMealPlanRepository } from '../persistence/PrismaMealPlanRepository.js';
import { PrismaUserRepository } from '../persistence/PrismaUserRepository.js';
import { CreateMealPlanUseCase } from '../../application/use-cases/nutrition/CreateMealPlanUseCase.js';
import { UpdateMealPlanUseCase } from '../../application/use-cases/nutrition/UpdateMealPlanUseCase.js';
import { NutritionController } from '../controllers/NutritionController.js';
import { createMealPlanSchema, updateMealPlanSchema } from '../validators/nutrition.schema.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const mealPlanRepository = new PrismaMealPlanRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

const createMealPlanUseCase = new CreateMealPlanUseCase(mealPlanRepository, userRepository);
const updateMealPlanUseCase = new UpdateMealPlanUseCase(mealPlanRepository);

const controller = new NutritionController(createMealPlanUseCase, updateMealPlanUseCase, mealPlanRepository);

const validateBody = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((err: ZodIssue) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      }));
      return res.status(400).json({ error: 'Validación entrante fallida', detalles: errorMessages });
    }
    return res.status(500).json({ error: 'Error interno en el middleware de validación.' });
  }
};

router.use(authenticate);

router.post('/plan', (_req, res) => {
  res.status(501).json({
    error: 'Nutrición no disponible temporalmente. Se requiere sistema de consentimiento profesional y aislamiento por gym que aún no está implementado.',
  });
});
router.put('/plan/:id', (_req, res) => {
  res.status(501).json({
    error: 'Nutrición no disponible temporalmente. Se requiere sistema de consentimiento profesional y aislamiento por gym que aún no está implementado.',
  });
});
router.get('/client/:clientId', (_req, res) => {
  res.status(501).json({
    error: 'Nutrición no disponible temporalmente. Se requiere sistema de consentimiento profesional y aislamiento por gym que aún no está implementado.',
  });
});
router.get('/plan/:id', (_req, res) => {
  res.status(501).json({
    error: 'Nutrición no disponible temporalmente. Se requiere sistema de consentimiento profesional y aislamiento por gym que aún no está implementado.',
  });
});
router.delete('/plan/:id', (_req, res) => {
  res.status(501).json({
    error: 'Nutrición no disponible temporalmente. Se requiere sistema de consentimiento profesional y aislamiento por gym que aún no está implementado.',
  });
});

export default router;
