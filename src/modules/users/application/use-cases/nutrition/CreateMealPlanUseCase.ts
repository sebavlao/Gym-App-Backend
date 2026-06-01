import { MealPlan } from '../../../domain/entities/MealPlan.js';
import type { IMealPlanRepository } from '../../../domain/repositories/IMealPlanRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';

// 1. Definimos la estructura estricta de lo que debe mandar el Front
interface MealItemInput {
  foodName: string;
  quantity: string;
  protein: number;
  carbs: number;
  fats: number;
  alternatives?: string | null;
}

interface MealInput {
  name: string;
  order: number;
  items: MealItemInput[];
}

interface CreateMealPlanInput {
  clientId: string;
  coachId: string; // ID de la Nutri (Cami)
  title: string;
  description?: string | null;
  meals: MealInput[];
  endDate: Date;
}

export class CreateMealPlanUseCase {
  // Inyectamos el repositorio de planes y el de usuarios para hacer validaciones cruzadas
  constructor(
    private mealPlanRepository: IMealPlanRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateMealPlanInput): Promise<void> {
    console.log(`🍎 Procesando nuevo plan nutricional: "${input.title}" para el alumno ID: ${input.clientId}`);

    // 1. Validación de seguridad rigurosa basada en el objeto de dominio devuelto
    const clientUser = await this.userRepository.findById(input.clientId);
    if (!clientUser) {
      throw new Error(`Operación abortada: El alumno especificado no existe en el sistema.`);
    }

    // 2. Mapeamos los datos de entrada a la estructura con IDs únicos generados en el backend
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

    // 3. Pasamos los datos por la Entidad de Dominio para ejecutar las reglas de validación de negocio
    const mealPlan = MealPlan.create({
      id: crypto.randomUUID(),
      clientId: input.clientId,
      coachId: input.coachId,
      title: input.title,
      description: input.description || null,
      meals: normalizedMeals,
      createdAt: new Date(),
      endDate: new Object(input.endDate) instanceof Date ? input.endDate : new Date(input.endDate)
    });

    // 4. Mandamos a persistir la estructura completa en la base de datos
    await this.mealPlanRepository.save(mealPlan);

    console.log(`✅ Plan nutricional "${mealPlan.title}" guardado y asociado con éxito.`);
  }
}