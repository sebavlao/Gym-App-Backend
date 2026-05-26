import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';

export class UserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: email, password y role' });
      }

      // Validamos que el rol sea uno de los permitidos por el Enum de Videla
      if (role !== 'Admin' && role !== 'Coach' && role !== 'Client') {
        return res.status(400).json({ error: 'El rol debe ser: Admin, Coach o Client' });
      }

      const newUser = await this.registerUserUseCase.execute({
        email,
        password_hash: password,
        role
      });

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error('🔴 ERROR EN USER CONTROLLER:', error);
      res.status(400).json({ error: error.message || 'Error al registrar el usuario' });
    }
  }
}