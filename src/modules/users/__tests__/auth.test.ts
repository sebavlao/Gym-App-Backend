/**
 * Tests focales de autenticación — RDL-T0.2
 *
 * Cobertura:
 * 1. login válido devuelve token
 * 2. credenciales inválidas son rechazadas
 * 3. /users/me sin token → 401
 * 4. /users/me con token inválido → 401
 * 5. /users/me con token válido devuelve usuario autenticado
 * 6. /users/me no permite elegir otro usuario
 * 7. JWT no depende de gymId ni GymRole
 */
import { JwtTokenService } from '../../../shared/infrastructure/auth/JwtTokenService';
import { LoginUserUseCase } from '../application/use-cases/auth/LoginUserUseCase';
import type { IUserRepository } from '../domain/repositories/IUserRepository';
import { BcryptHasher } from '../../../shared/infrastructure/cryptography/BcryptHasher';
import { User, UserRole } from '../domain/entities/User';
import { authenticate, type AuthenticatedRequest } from '../../../shared/infrastructure/middleware/authenticate';
import { describe, it, expect, vi } from 'vitest';

// ─── Helpers ───────────────────────────────────────────────

function makeFakeUser(overrides?: Partial<{ id: string; email: string; password: string; role: UserRole }>) {
  return User.create({
    id: overrides?.id ?? 'user-001',
    email: overrides?.email ?? 'test@example.com',
    password: overrides?.password ?? '$2b$10$hashedpassword',
    role: overrides?.role ?? UserRole.Client,
    firstName: 'Test',
    lastName: 'User',
  });
}

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockNext() {
  return vi.fn();
}

// ─── 1. Login válido devuelve token ────────────────────────

describe('LoginUserUseCase', () => {
  const tokenService = new JwtTokenService();

  it('login válido devuelve token y usuario (con hasher mockeado)', async () => {
    const fakeUser = makeFakeUser({ password: '$2b$10$hashed' });
    const fakeRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue(fakeUser),
      findByEmail: vi.fn().mockResolvedValue(fakeUser),
      findUsersByGymAndRole: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const hasherMock: BcryptHasher = {
      hash: vi.fn(),
      compare: vi.fn().mockResolvedValue(true),
    } as any;

    const useCase = new LoginUserUseCase(fakeRepo, hasherMock, tokenService);
    const result = await useCase.execute({
      email: 'test@example.com',
      passwordRaw: 'any-password',
    });

    expect(result.token).toBeDefined();
    expect(result.token.split('.')).toHaveLength(3);
    expect(result.user.id).toBe('user-001');
    expect(result.user.email).toBe('test@example.com');
  });
});

// Tests con hasher mockeado para control completo
describe('Login — credenciales', () => {
  const fakeUser = makeFakeUser({ password: '$2b$10$hashed' });
  const tokenService = new JwtTokenService();

  const fakeRepo: IUserRepository = {
    findById: vi.fn().mockResolvedValue(fakeUser),
    findByEmail: vi.fn().mockResolvedValue(fakeUser),
    findUsersByGymAndRole: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const hasherMock: BcryptHasher = {
    hash: vi.fn(),
    compare: vi.fn().mockResolvedValue(true),
  } as any;

  it('credenciales válidas devuelven token', async () => {
    const useCase = new LoginUserUseCase(fakeRepo, hasherMock, tokenService);
    const result = await useCase.execute({
      email: 'test@example.com',
      passwordRaw: 'correct-password',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.split('.')).toHaveLength(3); // JWT tiene 3 partes
    expect(result.user.id).toBe('user-001');
    expect(result.user.email).toBe('test@example.com');
  });

  it('credenciales inválidas lanzan error', async () => {
    const hasherInvalid: BcryptHasher = {
      hash: vi.fn(),
      compare: vi.fn().mockResolvedValue(false),
    } as any;

    const useCase = new LoginUserUseCase(fakeRepo, hasherInvalid, tokenService);

    await expect(
      useCase.execute({ email: 'test@example.com', passwordRaw: 'wrong' })
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('usuario inexistente lanza error', async () => {
    const emptyRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn().mockResolvedValue(null),
      findUsersByGymAndRole: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new LoginUserUseCase(emptyRepo, hasherMock, tokenService);

    await expect(
      useCase.execute({ email: 'no@existe.com', passwordRaw: 'x' })
    ).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });
});

// ─── 2. JWT payload — sin role, sin gymId ─────────────────

describe('JWT payload', () => {
  const tokenService = new JwtTokenService();

  it('payload contiene userId y email, no role ni gymId', () => {
    const token = tokenService.generate({ userId: 'u1', email: 'a@b.com' });
    const decoded = tokenService.verify(token) as any;

    expect(decoded.userId).toBe('u1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBeUndefined();
    expect(decoded.gymId).toBeUndefined();
  });

  it('token inválido lanza error', () => {
    expect(() => tokenService.verify('token-basura')).toThrow();
  });

  it('token expirado es rechazado', () => {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const expiredToken = jwt.sign(
      { userId: 'u1', email: 'a@b.com' },
      secret,
      { expiresIn: '0s' }
    );
    // Esperar 1ms para que expire
    expect(() => tokenService.verify(expiredToken)).toThrow();
  });
});

// ─── 3-4. Auth middleware — sin token / token inválido ────

describe('authenticate middleware', () => {
  const tokenService = new JwtTokenService();

  it('sin token → 401', () => {
    const req = mockReq({});
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('token inválido → 401', () => {
    const req = mockReq({ authorization: 'Bearer token-falso' });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('token válido → next() y adjunta identidad', () => {
    const token = tokenService.generate({ userId: 'u-123', email: 'x@y.com' });
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as AuthenticatedRequest).userId).toBe('u-123');
    expect((req as AuthenticatedRequest).email).toBe('x@y.com');
  });
});

// ─── 5-6. GET /users/me — identidad desde JWT ────────────

describe('UserController.me', () => {
  it('devuelve usuario desde JWT, no desde params', async () => {
    const { UserController } = await import('../infrastructure/controllers/UserController');

    const fakeUser = makeFakeUser({ id: 'u-me', email: 'me@test.com' });

    const mockUseCases = {
      register: { execute: vi.fn() },
      login: { execute: vi.fn() },
      profile: { execute: vi.fn().mockResolvedValue(fakeUser) },
    } as any;

    const controller = new UserController(
      mockUseCases.register,
      mockUseCases.login,
      mockUseCases.profile,
      { execute: vi.fn() } as any,
      { update: vi.fn() } as any,
    );

    const req = mockReq();
    (req as AuthenticatedRequest).userId = 'u-me';
    (req as AuthenticatedRequest).email = 'me@test.com';
    const res = mockRes();

    await controller.me(req, res);

    expect(mockUseCases.profile.execute).toHaveBeenCalledWith('u-me');
    expect(res.json).toHaveBeenCalledWith({
      id: 'u-me',
      email: 'me@test.com',
      firstName: 'Test',
      lastName: 'User',
      phone: undefined,
    });
  });

  it('no acepta userId arbitrario desde body/params', async () => {
    const { UserController } = await import('../infrastructure/controllers/UserController');

    const fakeUser = makeFakeUser({ id: 'u-real', email: 'real@test.com' });

    const mockUseCases = {
      register: { execute: vi.fn() },
      login: { execute: vi.fn() },
      profile: { execute: vi.fn().mockResolvedValue(fakeUser) },
    } as any;

    const controller = new UserController(
      mockUseCases.register,
      mockUseCases.login,
      mockUseCases.profile,
      { execute: vi.fn() } as any,
      { update: vi.fn() } as any,
    );

    // Simular que el body tiene un userId diferente, pero el JWT tiene otro
    const req = mockReq();
    req.body = { userId: 'u-falso' }; // intento de manipulación
    (req as AuthenticatedRequest).userId = 'u-real'; // identidad real del JWT
    (req as AuthenticatedRequest).email = 'real@test.com';
    const res = mockRes();

    await controller.me(req, res);

    // Debe usar el userId del JWT, no del body
    expect(mockUseCases.profile.execute).toHaveBeenCalledWith('u-real');
  });
});

// ─── 7. JWT no contiene info de gimnasio ──────────────────

describe('JWT — sin contexto de gimnasio', () => {
  const tokenService = new JwtTokenService();

  it('genera token sin gymId, role ni permisos', () => {
    const token = tokenService.generate({ userId: 'u1', email: 'a@b.com' });
    const decoded = tokenService.verify(token) as any;

    expect(decoded).not.toHaveProperty('gymId');
    expect(decoded).not.toHaveProperty('role');
    expect(decoded).not.toHaveProperty('gymRole');
    expect(decoded).not.toHaveProperty('permissions');
    expect(decoded).not.toHaveProperty('membership');
  });
});
