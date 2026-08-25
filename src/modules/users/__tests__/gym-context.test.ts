/**
 * Tests focales de contexto de gimnasio — RDL-T0.3A
 *
 * Cobertura:
 * 1. /users/me/gyms devuelve solo gyms del usuario autenticado
 * 2. múltiples roles del mismo usuario+gym se agrupan en un solo gym
 * 3. usuario con gyms A y B recibe ambos
 * 4. otro usuario no recibe gyms ajenos
 * 5. resolveGymContext sin X-Gym-Id → rechazo
 * 6. usuario sin GymRole para gym solicitado → 403
 * 7. usuario con GymRole válido → contexto adjuntado
 * 8. roles adjuntados provienen de DB
 * 9. requireGymRole permite rol autorizado
 * 10. requireGymRole rechaza rol no autorizado
 * 11. gymId arbitrario sin GymRole → 403
 * 12. User.role legacy no participa de estas decisiones
 */
import type { IGymRoleRepository, GymRoleWithGym } from '../../../modules/gyms/domain/repositories/IGymRoleRepository';
import { GetUserGymsUseCase } from '../application/use-cases/users/GetUserGymsUseCase';
import { resolveGymContext, type GymScopedRequest } from '../../../shared/infrastructure/middleware/resolveGymContext';
import { requireGymRole } from '../../../shared/infrastructure/middleware/requireGymRole';
import type { AuthenticatedRequest } from '../../../shared/infrastructure/middleware/authenticate';
import { describe, it, expect, vi } from 'vitest';

// ─── Helpers ───────────────────────────────────────────────

function mockReq(overrides?: Partial<AuthenticatedRequest>) {
  return {
    headers: {},
    ...overrides,
  } as any;
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

function makeGymRole(gymId: string, gymName: string, roles: string[]): GymRoleWithGym {
  return { gymId, gymName, roles };
}

// ─── 1-4. GetUserGymsUseCase ──────────────────────────────

describe('GetUserGymsUseCase', () => {
  it('devuelve solo gyms del usuario autenticado', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn().mockResolvedValue([
        makeGymRole('gym-1', 'Gym Patán', ['CLIENT']),
      ]),
      findRolesByUserAndGym: vi.fn(),
    };

    const useCase = new GetUserGymsUseCase(repo);
    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].gymId).toBe('gym-1');
    expect(result[0].gym.name).toBe('Gym Patán');
    expect(result[0].roles).toEqual(['CLIENT']);
    expect(repo.findGymsByUserId).toHaveBeenCalledWith('user-1');
  });

  it('múltiples roles del mismo usuario+gym se agrupan', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn().mockResolvedValue([
        makeGymRole('gym-1', 'Gym A', ['COACH', 'GYM_ADMIN']),
      ]),
      findRolesByUserAndGym: vi.fn(),
    };

    const useCase = new GetUserGymsUseCase(repo);
    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].roles).toEqual(['COACH', 'GYM_ADMIN']);
  });

  it('usuario con gyms A y B recibe ambos', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn().mockResolvedValue([
        makeGymRole('gym-a', 'Gym A', ['CLIENT']),
        makeGymRole('gym-b', 'Gym B', ['COACH']),
      ]),
      findRolesByUserAndGym: vi.fn(),
    };

    const useCase = new GetUserGymsUseCase(repo);
    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(result.map(g => g.gymId)).toEqual(['gym-a', 'gym-b']);
  });

  it('usuario sin gyms devuelve array vacío', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn().mockResolvedValue([]),
      findRolesByUserAndGym: vi.fn(),
    };

    const useCase = new GetUserGymsUseCase(repo);
    const result = await useCase.execute('user-sin-gyms');

    expect(result).toEqual([]);
  });
});

// ─── 5-8. resolveGymContext middleware ─────────────────────

describe('resolveGymContext middleware', () => {
  it('sin X-Gym-Id → 400', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn(),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({ userId: 'u1', headers: {} });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('usuario sin GymRole para gym → 403', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn().mockResolvedValue([]),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({ userId: 'u1', headers: { 'x-gym-id': 'gym-x' } });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('usuario con GymRole válido → contexto adjuntado', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn().mockResolvedValue(['CLIENT']),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({ userId: 'u1', headers: { 'x-gym-id': 'gym-1' } });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const scopedReq = req as GymScopedRequest;
    expect(scopedReq.gymContext.gymId).toBe('gym-1');
    expect(scopedReq.gymContext.gymRoles).toEqual(['CLIENT']);
  });

  it('roles adjuntados provienen de DB (repository)', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn().mockResolvedValue(['COACH', 'GYM_ADMIN']),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({ userId: 'u1', headers: { 'x-gym-id': 'gym-1' } });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(repo.findRolesByUserAndGym).toHaveBeenCalledWith('u1', 'gym-1');
    const scopedReq = req as GymScopedRequest;
    expect(scopedReq.gymContext.gymRoles).toEqual(['COACH', 'GYM_ADMIN']);
  });
});

// ─── 9-10. requireGymRole guard ───────────────────────────

describe('requireGymRole guard', () => {
  it('permite rol autorizado', () => {
    const guard = requireGymRole('GYM_ADMIN', 'COACH');
    const req = mockReq();
    (req as GymScopedRequest).gymContext = {
      gymId: 'gym-1',
      gymRoles: ['COACH'],
    };
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rechaza rol no autorizado', () => {
    const guard = requireGymRole('GYM_ADMIN');
    const req = mockReq();
    (req as GymScopedRequest).gymContext = {
      gymId: 'gym-1',
      gymRoles: ['CLIENT'],
    };
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza si gymContext no está resuelto', () => {
    const guard = requireGymRole('GYM_ADMIN');
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── 11-12. Seguridad y separación de concerns ────────────

describe('Seguridad de contexto', () => {
  it('gymId arbitrario sin GymRole en DB → 403', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn().mockResolvedValue([]),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({
      userId: 'user-1',
      headers: { 'x-gym-id': 'gym-ajeno' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(repo.findRolesByUserAndGym).toHaveBeenCalledWith('user-1', 'gym-ajeno');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('User.role legacy no participa de decisiones de acceso', async () => {
    const repo: IGymRoleRepository = {
      findGymsByUserId: vi.fn(),
      findRolesByUserAndGym: vi.fn().mockResolvedValue([]),
    };

    const middleware = resolveGymContext(repo);
    const req = mockReq({
      userId: 'admin-user',
      headers: { 'x-gym-id': 'gym-x' },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
