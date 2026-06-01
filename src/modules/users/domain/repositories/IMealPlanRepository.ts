import { MealPlan } from '../entities/MealPlan.js';

export interface IMealPlanRepository {
  save(mealPlan: MealPlan): Promise<void>; // <-- Ahora exige recibir la entidad real
  findByClientId(clientId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  delete(id: string): Promise<void>;
}