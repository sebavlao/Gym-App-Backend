import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import type { IMealPlanRepository } from '../../domain/repositories/IMealPlanRepository.js';
import { MealPlan } from '../../domain/entities/MealPlan.js';

export class PrismaMealPlanRepository implements IMealPlanRepository {
  constructor(private prisma: PrismaClient) {}

  async save(mealPlan: MealPlan): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.meal_Plan.deleteMany({
        where: { id: mealPlan.id }
      });

      await tx.meal_Plan.create({
        data: {
          id: mealPlan.id,
          client_id: mealPlan.clientId,
          coach_id: mealPlan.coachId,
          title: mealPlan.title,
          description: mealPlan.description,
          created_at: mealPlan.createdAt,
          end_date: mealPlan.endDate,
          meals: {
            create: mealPlan.meals.map((meal) => ({
              id: meal.id,
              name: meal.name,
              order: meal.order,
              items: {
                create: meal.items.map((item) => ({
                  id: item.id,
                  food_name: item.foodName,
                  quantity: item.quantity,
                  protein: item.protein,
                  carbs: item.carbs,
                  fats: item.fats,
                  alternatives: item.alternatives
                }))
              }
            }))
          }
        }
      });
    });
  }

  async findByClientId(clientId: string): Promise<any[]> {
    return await this.prisma.meal_Plan.findMany({
      where: { client_id: clientId },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: {
            items: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findById(id: string): Promise<any | null> {
    return await this.prisma.meal_Plan.findFirst({
      where: { id },
      include: {
        meals: {
          orderBy: { order: 'asc' },
          include: {
            items: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.meal_Plan.delete({
      where: { id }
    });
  }
}