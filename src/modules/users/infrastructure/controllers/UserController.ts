import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../../application/use-cases/users/GetUserProfileUseCase.js';
import { GetUserGymsUseCase } from '../../application/use-cases/users/GetUserGymsUseCase.js';
import type { AuthenticatedRequest } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { randomUUID } from 'crypto';

export class UserController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private getUserGymsUseCase: GetUserGymsUseCase,
  ) {}

  async register(req: Request, res: Response) {
    try {
      const { 
        email, 
        password, 
        role, 
        bloodType, 
        pathologies, 
        allergies, 
        emergencyContact, 
        observations 
      } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: email, password y role' 
        });
      }

      if (role === 'Client' && (!bloodType || !pathologies || !emergencyContact)) {
        return res.status(400).json({ 
          error: 'Faltan campos médicos obligatorios para el rol de Cliente: bloodType, pathologies, emergencyContact' 
        });
      }

      await this.registerUserUseCase.execute({
        id: randomUUID(),
        email,
        passwordRaw: password,
        role,
        bloodType,
        pathologies,
        allergies,
        emergencyContact,
        observations
      });

      res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error: any) {
      console.error('🔴 ERROR EN USER CONTROLLER:', error);
      res.status(400).json({ error: error.message || 'Error al registrar el usuario' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: email y password' });
      }

      const result = await this.loginUserUseCase.execute({
        email,
        passwordRaw: password,
      });

      res.status(200).json(result);
    } catch (error: any) {
      if (error.code === 'INVALID_CREDENTIALS' || error.code === 'USER_NOT_FOUND') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      console.error('🔴 ERROR EN LOGIN:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await this.getUserProfileUseCase.execute(authReq.userId);

      res.status(200).json({
        id: user.id,
        email: user.email,
      });
    } catch (error: any) {
      if (error.code === 'USER_NOT_FOUND') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      console.error('🔴 ERROR EN ME:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async meGyms(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const gyms = await this.getUserGymsUseCase.execute(authReq.userId);
      res.status(200).json(gyms);
    } catch (error: any) {
      console.error('🔴 ERROR EN ME/GYMS:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
