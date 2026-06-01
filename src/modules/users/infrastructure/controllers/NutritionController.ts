import type { Request, Response } from 'express';
import { CreateMealPlanUseCase } from '../../application/use-cases/nutrition/CreateMealPlanUseCase.js';
import { UpdateMealPlanUseCase } from '../../application/use-cases/nutrition/UpdateMealPlanUseCase.js';
import type { IMealPlanRepository } from '../../domain/repositories/IMealPlanRepository.js';

export class NutritionController {
  constructor(
    private createMealPlanUseCase: CreateMealPlanUseCase,
    private updateMealPlanUseCase: UpdateMealPlanUseCase, // Inyectamos el nuevo caso de uso
    private mealPlanRepository: IMealPlanRepository
  ) {}

  async createPlan(req: Request, res: Response) {
    try {
      const { client_id, coach_id, title, description, meals, end_date } = req.body;

      if (!client_id || !coach_id || !title || !meals || !end_date) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: client_id, coach_id, title, meals y end_date son requeridos.' 
        });
      }

      await this.createMealPlanUseCase.execute({
        clientId: client_id,
        coachId: coach_id,
        title,
        description,
        meals,
        endDate: new Date(end_date)
      });

      return res.status(201).json({ 
        message: 'Plan nutricional creado y asignado con éxito en el sistema.' 
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN NUTRITION CONTROLLER (createPlan):', error);
      return res.status(400).json({ 
        error: error.message || 'Error inesperado al procesar el plan nutricional.' 
      });
    }
  }

  async updatePlan(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { title, description, meals, end_date } = req.body;

      if (!title || !meals || !end_date) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios para la actualización: title, meals y end_date son requeridos.' 
        });
      }

      await this.updateMealPlanUseCase.execute({
        id,
        title,
        description,
        meals,
        endDate: new Date(end_date)
      });

      return res.status(200).json({ 
        message: 'Plan nutricional modificado y actualizado con éxito.' 
      });
    } catch (error: any) {
      console.error('🔴 ERROR EN NUTRITION CONTROLLER (updatePlan):', error);
      return res.status(400).json({ 
        error: error.message || 'Error inesperado al actualizar el plan nutricional.' 
      });
    }
  }

  async getPlansByClient(req: Request, res: Response) {
    try {
      const clientId = String(req.params.clientId);
      console.log(`🔍 Buscando planes nutricionales para el alumno ID: ${clientId}`);

      const plans = await this.mealPlanRepository.findByClientId(clientId);
      return res.status(200).json(plans);
    } catch (error: any) {
      console.error('🔴 ERROR EN NUTRITION CONTROLLER (getPlansByClient):', error);
      return res.status(500).json({ error: 'Error al obtener los planes alimentarios del alumno.' });
    }
  }

  async getPlanById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      console.log(`🔍 Buscando detalle del plan nutricional ID: ${id}`);

      const plan = await this.mealPlanRepository.findById(id);
      if (!plan) {
        return res.status(404).json({ error: 'El plan nutricional solicitado no existe.' });
      }

      return res.status(200).json(plan);
    } catch (error: any) {
      console.error('🔴 ERROR EN NUTRITION CONTROLLER (getPlanById):', error);
      return res.status(500).json({ error: 'Error al obtener el detalle del plan nutricional.' });
    }
  }

  async deletePlan(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      console.log(`🗑️ Eliminando plan nutricional ID: ${id}`);

      const planExists = await this.mealPlanRepository.findById(id);
      if (!planExists) {
        return res.status(404).json({ error: 'Operación fallida: El plan nutricional no existe o ya fue eliminado.' });
      }

      await this.mealPlanRepository.delete(id);
      return res.status(200).json({ message: 'Plan nutricional eliminado correctamente del sistema.' });
    } catch (error: any) {
      console.error('🔴 ERROR EN NUTRITION CONTROLLER (deletePlan):', error);
      return res.status(500).json({ error: 'Error al intentar eliminar el plan nutricional.' });
    }
  }
}