import { MealPlan } from '../../../domain/entities/MealPlan.js';
import type { IMealPlanRepository } from '../../../domain/repositories/IMealPlanRepository.js';

interface MealItemUpdateInput {
  foodName: string;
  quantity: string;
  protein: number;
  carbs: number;
  fats: number;
  alternatives?: string | null;
}

interface MealUpdateInput {
  name: string;
  order: number;
  items: MealItemUpdateInput[];
}

interface UpdateMealPlanInput {
  id: string;
  title: string;
  description?: string | null;
  meals: MealUpdateInput[];
  endDate: Date;
}

export class UpdateMealPlanUseCase {
  constructor(private mealPlanRepository: IMealPlanRepository) {}

  async execute(input: UpdateMealPlanInput): Promise<void> {
    console.log(`🔄 Procesando actualización del plan nutricional ID: ${input.id}`);

    // 1. Validar que el plan exista previamente en la base de datos
    const existingPlan = await this.mealPlanRepository.findById(input.id);
    if (!existingPlan) {
      throw new Error('No se puede actualizar: El plan nutricional especificado no existe.');
    }

    // 2. Normalizar la estructura entrante regenerando los IDs de la composición interna
    const normalizedMeals = input.meals.map((meal) => ({
      id: crypto.randomUUID(),
      name: meal.name,
      order: meal.order,
      items: meal.items.map((item) => ({
        id: crypto.randomUUID(),
        foodName: item.foodName,
        quantity: item.quantity,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        alternatives: item.alternatives || null
      }))
    }));

    // 3. Re-instanciar la Entidad de Dominio para garantizar que las nuevas modificaciones cumplan las reglas de negocio
    const updatedMealPlan = MealPlan.create({
      id: input.id,
      clientId: existingPlan.client_id,
      coachId: existingPlan.coach_id,
      title: input.title,
      description: input.description || null,
      meals: normalizedMeals,
      createdAt: existingPlan.created_at,
      endDate: new Object(input.endDate) instanceof Date ? input.endDate : new Date(input.endDate)
    });

    // 4. Persistir los cambios sobreescribiendo el agregado en la transacción
    await this.mealPlanRepository.save(updatedMealPlan);

    console.log(`✅ Plan nutricional "${updatedMealPlan.title}" actualizado con éxito en el sistema.`);
  }
}