import type { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../auth/JwtTokenService.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
  email: string;
}

const tokenService = new JwtTokenService();

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = tokenService.verify(token) as { userId: string; email: string };
    const authReq = req as AuthenticatedRequest;
    authReq.userId = decoded.userId;
    authReq.email = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
