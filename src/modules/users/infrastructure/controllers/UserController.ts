import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';


export class UserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: email, password y role' });
      }

      // Videla requiere un ID y passwordRaw, no password_hash
      await this.registerUserUseCase.execute({
        id: crypto.randomUUID(), 
        email,
        passwordRaw: password, 
        role
      });

      res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error: any) {
      console.error('🔴 ERROR EN USER CONTROLLER:', error);
      res.status(400).json({ error: error.message || 'Error al registrar el usuario' });
    }
  }
}