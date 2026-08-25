import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../../application/use-cases/users/GetUserProfileUseCase.js';
import { GetUserGymsUseCase } from '../../application/use-cases/users/GetUserGymsUseCase.js';
import type { AuthenticatedRequest } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { BcryptHasher } from '../../../../shared/infrastructure/cryptography/BcryptHasher.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { randomUUID } from 'crypto';

export class UserController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private getUserGymsUseCase: GetUserGymsUseCase,
    private userRepository: IUserRepository,
  ) {}

  async register(req: Request, res: Response) {
    try {
      const { 
        email, 
        password, 
        firstName,
        lastName,
        phone,
        bloodType, 
        pathologies, 
        allergies, 
        emergencyContact, 
        observations 
      } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: email, password, firstName y lastName' 
        });
      }

      await this.registerUserUseCase.execute({
        id: randomUUID(),
        email,
        passwordRaw: password,
        role: 'Client' as any,
        firstName,
        lastName,
        phone,
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
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
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

  async changePassword(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: currentPassword y newPassword' 
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 8 caracteres' 
        });
      }

      const user = await this.getUserProfileUseCase.execute(authReq.userId);
      
      if (!user.password) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
      }

      const hasher = new BcryptHasher();
      const isValid = await hasher.compare(currentPassword, user.password);
      
      if (!isValid) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }

      const hashedNewPassword = await hasher.hash(newPassword);
      user.setPassword(hashedNewPassword);
      await this.userRepository.update(user);

      res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error: any) {
      console.error('🔴 ERROR EN CHANGE PASSWORD:', error);
      res.status(500).json({ error: error.message || 'Error al cambiar la contraseña' });
    }
  }
}
