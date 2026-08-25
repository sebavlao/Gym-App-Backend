import type { Request, Response } from 'express';
import type { GymScopedRequest } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { ListGymUsersUseCase } from '../../application/use-cases/gym-users/ListGymUsersUseCase.js';
import { CreateGymUserUseCase } from '../../application/use-cases/gym-users/CreateGymUserUseCase.js';

export class GymUsersController {
  constructor(
    private listGymUsersUseCase: ListGymUsersUseCase,
    private createGymUserUseCase: CreateGymUserUseCase,
  ) {}

  async listClients(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const actorUserId = scopedReq.userId;
      const actorRoles = scopedReq.gymContext.gymRoles;

      const clients = await this.listGymUsersUseCase.execute({
        gymId,
        role: 'CLIENT',
        actorUserId,
        actorRoles,
      });

      res.status(200).json(clients);
    } catch (error: any) {
      console.error('🔴 ERROR EN GYM USERS CONTROLLER (LIST CLIENTS):', error);
      res.status(500).json({ error: error.message || 'Error al listar clientes' });
    }
  }

  async listCoaches(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;

      const coaches = await this.listGymUsersUseCase.execute({
        gymId,
        role: 'COACH',
      });

      res.status(200).json(coaches);
    } catch (error: any) {
      console.error('🔴 ERROR EN GYM USERS CONTROLLER (LIST COACHES):', error);
      res.status(500).json({ error: error.message || 'Error al listar coaches' });
    }
  }

  async createClient(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { email, password, firstName, lastName, phone, bloodType, pathologies, allergies, emergencyContact, observations } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: email, firstName y lastName' 
        });
      }

      const result = await this.createGymUserUseCase.execute({
        gymId,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'CLIENT',
        bloodType,
        pathologies,
        allergies,
        emergencyContact,
        observations,
      });

      res.status(result.isNew ? 201 : 200).json({ 
        message: result.isNew ? 'Cliente creado y asignado al gimnasio con éxito' : 'Cliente existente asignado al gimnasio con éxito',
        userId: result.user.id,
      });
    } catch (error: any) {
      if (error.code === 'ALREADY_MEMBER') {
        return res.status(409).json({ error: error.message });
      }
      console.error('🔴 ERROR EN GYM USERS CONTROLLER (CREATE CLIENT):', error);
      res.status(400).json({ error: error.message || 'Error al crear el cliente' });
    }
  }

  async createCoach(req: Request, res: Response) {
    try {
      const scopedReq = req as GymScopedRequest;
      const gymId = scopedReq.gymContext.gymId;
      const { email, password, firstName, lastName, phone, bloodType, pathologies, allergies, emergencyContact, observations } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: email, firstName y lastName' 
        });
      }

      const result = await this.createGymUserUseCase.execute({
        gymId,
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'COACH',
        bloodType,
        pathologies,
        allergies,
        emergencyContact,
        observations,
      });

      res.status(result.isNew ? 201 : 200).json({ 
        message: result.isNew ? 'Coach creado y asignado al gimnasio con éxito' : 'Coach existente asignado al gimnasio con éxito',
        userId: result.user.id,
      });
    } catch (error: any) {
      if (error.code === 'ALREADY_MEMBER') {
        return res.status(409).json({ error: error.message });
      }
      console.error('🔴 ERROR EN GYM USERS CONTROLLER (CREATE COACH):', error);
      res.status(400).json({ error: error.message || 'Error al crear el coach' });
    }
  }
}
