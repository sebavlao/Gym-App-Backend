import jwt from 'jsonwebtoken';

export class JwtTokenService {
  private readonly secret: string;

  constructor() {
    // Ideally injected via config/env service
    this.secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  }

  generate(payload: { id: string; email: string; role: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1d' });
  }

  verify(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid or expired token ' + error);
    }
  }
}
