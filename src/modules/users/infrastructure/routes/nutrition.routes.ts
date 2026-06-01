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

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const mealPlanRepository = new PrismaMealPlanRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

const createMealPlanUseCase = new CreateMealPlanUseCase(mealPlanRepository, userRepository);
const updateMealPlanUseCase = new UpdateMealPlanUseCase(mealPlanRepository);

const controller = new NutritionController(createMealPlanUseCase, updateMealPlanUseCase, mealPlanRepository);

// Middleware genérico interceptor de esquemas de Zod corregido y tipado
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

// Endpoints protegidos con el escudo de Zod
router.post('/plan', validateBody(createMealPlanSchema), (req, res) => controller.createPlan(req, res));
router.put('/plan/:id', validateBody(updateMealPlanSchema), (req, res) => controller.updatePlan(req, res));
router.get('/client/:clientId', (req, res) => controller.getPlansByClient(req, res));
router.get('/plan/:id', (req, res) => controller.getPlanById(req, res));
router.delete('/plan/:id', (req, res) => controller.deletePlan(req, res));

export default router;