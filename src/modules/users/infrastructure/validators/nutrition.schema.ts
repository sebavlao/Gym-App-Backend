import { z } from 'zod';

// Esquema para cada alimento individual
const mealItemSchema = z.object({
  foodName: z.string({ message: 'El nombre del alimento es obligatorio.' }).min(2, 'El nombre del alimento es muy corto.'),
  quantity: z.string({ message: 'La cantidad es obligatoria.' }),
  protein: z.number({ message: 'La proteína debe ser un número.' }).min(0, 'Las proteínas no pueden ser negativas.'),
  carbs: z.number({ message: 'Los carbohidratos deben ser un número.' }).min(0, 'Los carbohidratos no pueden ser negativos.'),
  fats: z.number({ message: 'Las grasas deben ser un número.' }).min(0, 'Las grasas no pueden ser negativas.'),
  alternatives: z.string().nullable().optional(),
});

// Esquema para cada comida que agrupa alimentos
const mealSchema = z.object({
  name: z.string({ message: 'El nombre de la comida es obligatorio.' }),
  order: z.number({ message: 'El orden de la comida es requerido.' }).int().positive('El orden debe ser un número entero positivo.'),
  items: z.array(mealItemSchema).min(1, 'Cada comida debe incluir al menos un alimento.'),
});

// Esquema estricto para la CREACIÓN del plan alimentario (POST)
export const createMealPlanSchema = z.object({
  client_id: z.string({ message: 'El ID del alumno es obligatorio.' }).uuid('Formato de ID de alumno inválido.'),
  coach_id: z.string({ message: 'El ID de la nutricionista es obligatorio.' }).uuid('Formato de ID de nutricionista inválido.'),
  title: z.string({ message: 'El título del plan es obligatorio.' }).min(3, 'El título del plan debe tener al menos 3 caracteres.'),
  description: z.string().nullable().optional(),
  end_date: z.string({ message: 'La fecha de finalización es obligatoria.' }).datetime({ message: 'La fecha debe cumplir el formato ISO 8601 de TypeScript.' }),
  meals: z.array(mealSchema).min(1, 'El plan nutricional debe contener al menos una comida.'),
});

// Esquema para la ACTUALIZACIÓN del plan alimentario (PUT)
export const updateMealPlanSchema = z.object({
  title: z.string({ message: 'El título del plan es obligatorio.' }).min(3, 'El título del plan debe tener al menos 3 caracteres.'),
  description: z.string().nullable().optional(),
  end_date: z.string({ message: 'La fecha de finalización es obligatoria.' }).datetime({ message: 'La fecha debe cumplir el formato ISO 8601 de TypeScript.' }),
  meals: z.array(mealSchema).min(1, 'El plan nutricional debe contener al menos una comida.'),
});