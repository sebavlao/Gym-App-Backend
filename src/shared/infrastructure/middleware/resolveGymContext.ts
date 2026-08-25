import type { Response, NextFunction } from 'express';
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
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const gymId = req.headers['x-gym-id'] as string | undefined;

    if (!gymId) {
      return res.status(400).json({ error: 'Header X-Gym-Id requerido' });
    }

    try {
      const roles = await gymRoleRepository.findRolesByUserAndGym(req.userId, gymId);

      if (roles.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a este gimnasio' });
      }

      const scopedReq = req as GymScopedRequest;
      scopedReq.gymContext = { gymId, gymRoles: roles };

      next();
    } catch {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}
