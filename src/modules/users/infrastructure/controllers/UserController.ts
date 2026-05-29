import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase.js';
import { randomUUID } from 'crypto';

export class UserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

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

      // 1. Validación de campos básicos
      if (!email || !password || !role) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios: email, password y role' 
        });
      }

      // 2. Validación específica para clientes
      if (role === 'Client' && (!bloodType || !pathologies || !emergencyContact)) {
        return res.status(400).json({ 
          error: 'Faltan campos médicos obligatorios para el rol de Cliente: bloodType, pathologies, emergencyContact' 
        });
      }

      // 3. Ejecución del caso de uso
      // Nota: Si tu RegisterUserUseCase espera los campos aplanados, 
      // asegurate de pasar las propiedades directamente aquí.
      await this.registerUserUseCase.execute({
        id: randomUUID(),
        email,
        passwordRaw: password,
        role,
        // Pasamos todos los campos disponibles. 
        // Si el Caso de Uso espera el objeto aplanado, 
        // simplemente quitá "medicalFields:" y poné los campos directos.
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
}