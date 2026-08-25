import type { Request, Response, NextFunction } from 'express';
import type { GymScopedRequest } from './resolveGymContext.js';

export function requireGymRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const scopedReq = req as GymScopedRequest;

    if (!scopedReq.gymContext) {
      return res.status(403).json({ error: 'Contexto de gimnasio no resuelto' });
    }

    const hasRole = scopedReq.gymContext.gymRoles.some(role =>
      allowedRoles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({ error: 'Rol insuficiente para esta acción' });
    }

    next();
  };
}
