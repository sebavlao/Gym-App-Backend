import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authenticate.js';
import type { IGymRoleRepository } from '../../../modules/gyms/domain/repositories/IGymRoleRepository.js';

export interface GymContext {
  gymId: string;
  gymRoles: string[];
}

export interface GymScopedRequest extends AuthenticatedRequest {
  gymContext: GymContext;
}

export function resolveGymContext(gymRoleRepository: IGymRoleRepository) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const gymId = req.headers['x-gym-id'] as string | undefined;

    if (!gymId) {
      res.status(400).json({ error: 'Header X-Gym-Id requerido' });
      return;
    }

    try {
      const roles = await gymRoleRepository.findRolesByUserAndGym(authReq.userId, gymId);

      if (roles.length === 0) {
        res.status(403).json({ error: 'No tienes acceso a este gimnasio' });
        return;
      }

      const scopedReq = req as GymScopedRequest;
      scopedReq.gymContext = { gymId, gymRoles: roles };

      next();
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}
