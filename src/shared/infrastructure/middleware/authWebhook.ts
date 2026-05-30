import type { Request, Response, NextFunction } from 'express';

export const authWebhook = (req: Request, res: Response, next: NextFunction) => {
  const secretToken = req.headers['x-webhook-secret'];

  // En producción, esto debería ser una variable de entorno fuerte
  const MY_SECRET = process.env.WEBHOOK_SECRET || 'mi-clave-super-secreta';

  if (secretToken !== MY_SECRET) {
    console.warn('⚠️ Intento de acceso no autorizado al Webhook detectado.');
    return res.status(401).json({ error: 'Acceso no autorizado.' });
  }

  next();
};