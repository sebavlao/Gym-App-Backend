/**
 * Tests de aislamiento multi-tenant (cross-gym isolation) — RDL-T0.3B Fase 6
 *
 * Cobertura (24+ escenarios):
 * - Memberships: aislamiento por gym, coach solo ve asignados, admin ve todos
 * - Exercises: custom por gym no visible en otro, global sí visible
 * - Routines: no accesibles entre gyms, coach solo asignados, cliente propio
 * - Training Logs: no accesibles entre gyms, coach solo asignados, cliente propio
 * - Contexto/privilege escalation: cambiar X-Gym-Id no otorga acceso, roles no se transfieren
 * - Cross-role: GYM_ADMIN en gym A no es admin en gym B
 */
import type { IGymRoleRepository } from '../gyms/domain/repositories/IGymRoleRepository';
import type { IMembershipRepository } from '../gyms/domain/repositories/IMembershipRepository';
import type { ExerciseRepository } from '../workouts/domain/repositories/IExerciseRepository';
import type { GymScopedRequest } from '../../shared/infrastructure/middleware/resolveGymContext';
import { resolveGymContext } from '../../shared/infrastructure/middleware/resolveGymContext';
import { requireGymRole } from '../../shared/infrastructure/middleware/requireGymRole';
import { MembershipController } from '../gyms/infrastructure/controllers/MembershipController';
import { ExerciseController } from '../workouts/infrastructure/controllers/exercise.controller';
import { RoutineController } from '../workouts/infrastructure/controllers/routine.controller';
import { TrainingLogController } from '../workouts/infrastructure/controllers/training-log.controller';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Constants ─────────────────────────────────────────────
const GYM_A = 'gym-a';
const GYM_B = 'gym-b';
const USER_ADMIN_A = 'admin-a';
const USER_COACH_A = 'coach-a';
const USER_CLIENT_A = 'client-a';
const USER_CLIENT_B = 'client-b';
const USER_ADMIN_B = 'admin-b';

// ─── Helpers ───────────────────────────────────────────────

function mockReq(overrides?: Record<string, any>) {
  return { headers: {}, body: {}, params: {}, ...overrides } as any;
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

function scopedTo(
  req: any,
  gymId: string,
  gymRoles: string[],
  userId: string,
  email = 'user@test.com',
) {
  req.userId = userId;
  req.email = email;
  req.gymContext = { gymId, gymRoles };
  return req as GymScopedRequest;
}

function makeRepo(overrides: Partial<IGymRoleRepository> = {}): IGymRoleRepository {
  return {
    findGymsByUserId: vi.fn().mockResolvedValue([]),
    findRolesByUserAndGym: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    ...overrides,
  };
}

function makeMembershipRepo(overrides: Partial<IMembershipRepository> = {}): IMembershipRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue([]),
    findByGymId: vi.fn().mockResolvedValue([]),
    findByGymIdAndCoachId: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    update: vi.fn(),
    ...overrides,
  };
}

function makeExerciseRepo(overrides: Partial<ExerciseRepository> = {}): ExerciseRepository {
  return {
    create: vi.fn(),
    findAll: vi.fn().mockResolvedValue([]),
    findAllByGym: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// 1. MEMBERSHIPS — Aislamiento por gym
// ═══════════════════════════════════════════════════════════

describe('Membership — Aislamiento cross-gym', () => {
  let gymRoleRepo: IGymRoleRepository;
  let membershipRepo: IMembershipRepository;
  let controller: MembershipController;

  beforeEach(() => {
    gymRoleRepo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockImplementation((userId: string, gymId: string) => {
        if (userId === USER_ADMIN_A && gymId === GYM_A) return Promise.resolve(['GYM_ADMIN']);
        if (userId === USER_COACH_A && gymId === GYM_A) return Promise.resolve(['COACH']);
        if (userId === USER_CLIENT_A && gymId === GYM_A) return Promise.resolve(['CLIENT']);
        if (userId === USER_ADMIN_B && gymId === GYM_B) return Promise.resolve(['GYM_ADMIN']);
        if (userId === USER_CLIENT_B && gymId === GYM_B) return Promise.resolve(['CLIENT']);
        return Promise.resolve([]);
      }),
    });
    membershipRepo = makeMembershipRepo();
    controller = new MembershipController(
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      membershipRepo,
      gymRoleRepo,
    );
  });

  it('GYM_ADMIN en gym A solo ve membresías de gym A', async () => {
    const membershipsGymA = [
      { id: 'm1', userId: USER_CLIENT_A, gymId: GYM_A },
    ];
    membershipRepo.findByGymId = vi.fn().mockResolvedValue(membershipsGymA);

    const req = mockReq();
    scopedTo(req, GYM_A, ['GYM_ADMIN'], USER_ADMIN_A);
    const res = mockRes();

    await controller.list(req, res);

    expect(membershipRepo.findByGymId).toHaveBeenCalledWith(GYM_A);
    expect(membershipRepo.findByGymId).not.toHaveBeenCalledWith(GYM_B);
    expect(res.json).toHaveBeenCalledWith(membershipsGymA);
  });

  it('COACH en gym A solo ve asignaciones propias en gym A', async () => {
    const assigned = [
      { id: 'm1', userId: USER_CLIENT_A, gymId: GYM_A, coachId: USER_COACH_A },
    ];
    membershipRepo.findByGymIdAndCoachId = vi.fn().mockResolvedValue(assigned);

    const req = mockReq();
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await controller.list(req, res);

    expect(membershipRepo.findByGymIdAndCoachId).toHaveBeenCalledWith(GYM_A, USER_COACH_A);
    expect(res.json).toHaveBeenCalledWith(assigned);
  });

  it('CLIENT no puede listar membresías (403)', async () => {
    const req = mockReq();
    scopedTo(req, GYM_A, ['CLIENT'], USER_CLIENT_A);
    const res = mockRes();

    await controller.list(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('crear membresía usa gymId del contexto, no del body', async () => {
    const createUseCase = { execute: vi.fn() };
    const ctrl = new MembershipController(
      createUseCase as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      membershipRepo,
      gymRoleRepo,
    );

    const req = mockReq({ body: { user_id: 'new-user' } });
    scopedTo(req, GYM_A, ['GYM_ADMIN'], USER_ADMIN_A);
    const res = mockRes();

    await ctrl.create(req, res);

    expect(createUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ gymId: GYM_A }),
    );
  });

  it('body con gym_id distinto al contexto es rechazado (400)', async () => {
    const req = mockReq({ body: { user_id: 'new-user', gym_id: GYM_B } });
    scopedTo(req, GYM_A, ['GYM_ADMIN'], USER_ADMIN_A);
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('gym_id') }),
    );
  });
});

// ═══════════════════════════════════════════════════════════
// 2. EXERCISES — Aislamiento por gym
// ═══════════════════════════════════════════════════════════

describe('Exercise — Aislamiento cross-gym', () => {
  let exerciseRepo: ExerciseRepository;
  let controller: ExerciseController;

  beforeEach(() => {
    exerciseRepo = makeExerciseRepo();
    controller = new ExerciseController(
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      exerciseRepo,
    );
  });

  it('GET /exercises en gym A solo retorna ejercicios de gym A', async () => {
    const exercisesA = [
      { id: 'e1', name: 'Sentadilla', gym_id: GYM_A },
    ];
    exerciseRepo.findAllByGym = vi.fn().mockResolvedValue(exercisesA);

    const req = mockReq();
    scopedTo(req, GYM_A, ['CLIENT'], USER_CLIENT_A);
    const res = mockRes();

    await controller.getAll(req, res);

    expect(exerciseRepo.findAllByGym).toHaveBeenCalledWith(GYM_A);
    expect(res.json).toHaveBeenCalledWith(exercisesA);
  });

  it('POST /exercises pasa gymId del contexto al use case', async () => {
    const createdExercise = { id: 'e-new', name: 'Press', gym_id: GYM_A };
    const mockUseCase = { execute: vi.fn().mockResolvedValue(createdExercise) };

    const ctrl = new ExerciseController(
      mockUseCase as any,
      { execute: vi.fn() } as any,
      exerciseRepo,
    );

    const req = mockReq({ body: { name: 'Press', muscle_group: 'Pecho' } });
    scopedTo(req, GYM_A, ['GYM_ADMIN'], USER_ADMIN_A);
    const res = mockRes();

    await ctrl.create(req, res);

    expect(mockUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Press', muscle_group: 'Pecho' }),
      GYM_A,
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('ejercicios custom de gym A no se ven en gym B', async () => {
    const exercisesA = [
      { id: 'e1', name: 'Ejercicio Custom A', gym_id: GYM_A, is_custom: true },
    ];
    const exercisesB = [
      { id: 'e2', name: 'Ejercicio Custom B', gym_id: GYM_B, is_custom: true },
    ];
    exerciseRepo.findAllByGym = vi.fn()
      .mockResolvedValueOnce(exercisesA)
      .mockResolvedValueOnce(exercisesB);

    const reqA = mockReq();
    scopedTo(reqA, GYM_A, ['CLIENT'], USER_CLIENT_A);
    const resA = mockRes();
    await controller.getAll(reqA, resA);

    const reqB = mockReq();
    scopedTo(reqB, GYM_B, ['CLIENT'], USER_CLIENT_B);
    const resB = mockRes();
    await controller.getAll(reqB, resB);

    expect(exerciseRepo.findAllByGym).toHaveBeenCalledWith(GYM_A);
    expect(exerciseRepo.findAllByGym).toHaveBeenCalledWith(GYM_B);
    expect(resA.json).toHaveBeenCalledWith(exercisesA);
    expect(resB.json).toHaveBeenCalledWith(exercisesB);
    // El exercise de gym A no aparece en la respuesta de gym B
    expect(resB.json).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'e1' })]),
    );
  });
});

// ═══════════════════════════════════════════════════════════
// 3. ROUTINES — Aislamiento cross-gym
// ═══════════════════════════════════════════════════════════

describe('Routine — Aislamiento cross-gym', () => {
  let gymRoleRepo: IGymRoleRepository;
  let membershipRepo: IMembershipRepository;
  let controller: RoutineController;

  beforeEach(() => {
    gymRoleRepo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockImplementation((userId: string, gymId: string) => {
        if (userId === USER_CLIENT_A && gymId === GYM_A) return Promise.resolve(['CLIENT']);
        if (userId === USER_COACH_A && gymId === GYM_A) return Promise.resolve(['COACH']);
        if (userId === USER_CLIENT_B && gymId === GYM_B) return Promise.resolve(['CLIENT']);
        return Promise.resolve([]);
      }),
    });
    membershipRepo = makeMembershipRepo({
      findByGymIdAndCoachId: vi.fn().mockImplementation((gymId: string, coachId: string) => {
        if (gymId === GYM_A && coachId === USER_COACH_A) {
          return Promise.resolve([{ userId: USER_CLIENT_A, gymId: GYM_A, coachId: USER_COACH_A }]);
        }
        return Promise.resolve([]);
      }),
    });
    controller = new RoutineController(
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      gymRoleRepo,
      membershipRepo,
    );
  });

  it('cliente de gym A no puede ver rutinas desde gym B', async () => {
    const req = mockReq({ params: { clientId: USER_CLIENT_A } });
    scopedTo(req, GYM_B, ['CLIENT'], USER_CLIENT_B);
    const res = mockRes();

    await controller.getByClient(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('coach de gym A no puede crear rutina para cliente de gym B', async () => {
    const req = mockReq({
      body: {
        client_id: USER_CLIENT_B,
        title: 'Rutina',
        days: [{ name: 'Día 1', order: 0, exercises: [{ exerciseId: 'e1', series: 3, repetitions: '10', order: 0 }] }],
      },
    });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('gimnasio') }),
    );
  });

  it('coach solo ve rutinas de alumnos asignados en su gym', async () => {
    const getUseCase = { execute: vi.fn().mockResolvedValue([{ id: 'r1', title: 'Rutina' }]) };
    const ctrl = new RoutineController(
      { execute: vi.fn() } as any,
      getUseCase as any,
      gymRoleRepo,
      membershipRepo,
    );

    const req = mockReq({ params: { clientId: USER_CLIENT_A } });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await ctrl.getByClient(req, res);

    expect(getUseCase.execute).toHaveBeenCalledWith(USER_CLIENT_A);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('coach no ve rutinas de alumno no asignado (403)', async () => {
    const req = mockReq({ params: { clientId: 'unassigned-client' } });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await controller.getByClient(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ═══════════════════════════════════════════════════════════
// 4. TRAINING LOGS — Aislamiento cross-gym
// ═══════════════════════════════════════════════════════════

describe('TrainingLog — Aislamiento cross-gym', () => {
  let gymRoleRepo: IGymRoleRepository;
  let membershipRepo: IMembershipRepository;
  let controller: TrainingLogController;

  beforeEach(() => {
    gymRoleRepo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockImplementation((userId: string, gymId: string) => {
        if (userId === USER_CLIENT_A && gymId === GYM_A) return Promise.resolve(['CLIENT']);
        if (userId === USER_COACH_A && gymId === GYM_A) return Promise.resolve(['COACH']);
        if (userId === 'otro-usuario' && gymId === GYM_A) return Promise.resolve(['CLIENT']);
        if (userId === USER_CLIENT_B && gymId === GYM_B) return Promise.resolve(['CLIENT']);
        return Promise.resolve([]);
      }),
    });
    membershipRepo = makeMembershipRepo({
      findByGymIdAndCoachId: vi.fn().mockImplementation((gymId: string, coachId: string) => {
        if (gymId === GYM_A && coachId === USER_COACH_A) {
          return Promise.resolve([{ userId: USER_CLIENT_A, gymId: GYM_A, coachId: USER_COACH_A }]);
        }
        return Promise.resolve([]);
      }),
    });
    controller = new TrainingLogController(
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any,
      gymRoleRepo,
      membershipRepo,
    );
  });

  it('cliente de gym A no puede ver training logs desde gym B', async () => {
    const req = mockReq({ params: { clientId: USER_CLIENT_A } });
    scopedTo(req, GYM_B, ['CLIENT'], USER_CLIENT_B);
    const res = mockRes();

    await controller.getByClient(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('coach de gym A no puede registrar log para cliente de gym B', async () => {
    const req = mockReq({
      body: {
        client_id: USER_CLIENT_B,
        routine_exercise_id: 're1',
        weight_used: 50,
        actual_reps: 10,
      },
    });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('cliente solo puede registrar log para sí mismo', async () => {
    const createUseCase = { execute: vi.fn() };
    const ctrl = new TrainingLogController(
      createUseCase as any,
      { execute: vi.fn() } as any,
      gymRoleRepo,
      membershipRepo,
    );

    const req = mockReq({
      body: {
        client_id: 'otro-usuario',
        routine_exercise_id: 're1',
        weight_used: 50,
        actual_reps: 10,
      },
    });
    scopedTo(req, GYM_A, ['CLIENT'], USER_CLIENT_A);
    const res = mockRes();

    await ctrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('mismo') }),
    );
  });

  it('coach solo ve logs de alumnos asignados en su gym', async () => {
    const getUseCase = { execute: vi.fn().mockResolvedValue([{ id: 'tl1' }]) };
    const ctrl = new TrainingLogController(
      { execute: vi.fn() } as any,
      getUseCase as any,
      gymRoleRepo,
      membershipRepo,
    );

    const req = mockReq({ params: { clientId: USER_CLIENT_A } });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await ctrl.getByClient(req, res);

    expect(getUseCase.execute).toHaveBeenCalledWith(USER_CLIENT_A);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('coach no ve logs de alumno no asignado (403)', async () => {
    const req = mockReq({ params: { clientId: 'unassigned-client' } });
    scopedTo(req, GYM_A, ['COACH'], USER_COACH_A);
    const res = mockRes();

    await controller.getByClient(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ═══════════════════════════════════════════════════════════
// 5. CONTEXTO — Privilege escalation
// ═══════════════════════════════════════════════════════════

describe('Contexto — Protección contra privilege escalation', () => {
  it('cambiar X-Gym-Id no otorga acceso si no hay GymRole en DB', async () => {
    const repo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockResolvedValue([]),
    });
    const middleware = resolveGymContext(repo);
    const req = mockReq({
      userId: USER_CLIENT_A,
      headers: { 'x-gym-id': GYM_B },
    });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('roles de gym A no se transfieren a gym B', async () => {
    const repo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockImplementation((userId: string, gymId: string) => {
        if (gymId === GYM_A) return Promise.resolve(['GYM_ADMIN', 'COACH']);
        return Promise.resolve([]);
      }),
    });

    const middleware = resolveGymContext(repo);

    // Acceso a gym A → ok
    const reqA = mockReq({ userId: USER_ADMIN_A, headers: { 'x-gym-id': GYM_A } });
    const resA = mockRes();
    const nextA = mockNext();
    await middleware(reqA, resA, nextA);
    expect(nextA).toHaveBeenCalled();

    // Mismo usuario intenta gym B → rechazado
    const reqB = mockReq({ userId: USER_ADMIN_A, headers: { 'x-gym-id': GYM_B } });
    const resB = mockRes();
    const nextB = mockNext();
    await middleware(reqB, resB, nextB);
    expect(resB.status).toHaveBeenCalledWith(403);
    expect(nextB).not.toHaveBeenCalled();
  });

  it('membership en gym A no da acceso a gym B', async () => {
    const gymRoleRepo = makeRepo({
      findRolesByUserAndGym: vi.fn().mockImplementation((userId: string, gymId: string) => {
        if (userId === USER_CLIENT_A && gymId === GYM_A) return Promise.resolve(['CLIENT']);
        if (userId === USER_CLIENT_A && gymId === GYM_B) return Promise.resolve([]);
        return Promise.resolve([]);
      }),
    });

    const middleware = resolveGymContext(gymRoleRepo);

    const req = mockReq({ userId: USER_CLIENT_A, headers: { 'x-gym-id': GYM_B } });
    const res = mockRes();
    const next = mockNext();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════
// 6. CROSS-ROLE — Roles no se transfieren entre gyms
// ═══════════════════════════════════════════════════════════

describe('Cross-role — Roles específicos por gym', () => {
  it('requireGymRole permite GYM_ADMIN solo en el gym correcto', () => {
    const guard = requireGymRole('GYM_ADMIN');

    // Admin de gym A → permitido en gym A
    const reqA = mockReq();
    (reqA as GymScopedRequest).gymContext = { gymId: GYM_A, gymRoles: ['GYM_ADMIN'] };
    const resA = mockRes();
    const nextA = mockNext();
    guard(reqA, resA, nextA);
    expect(nextA).toHaveBeenCalled();

    // Mismo admin intenta actuar como GYM_ADMIN en gym B → rechazado
    const reqB = mockReq();
    (reqB as GymScopedRequest).gymContext = { gymId: GYM_B, gymRoles: ['CLIENT'] };
    const resB = mockRes();
    const nextB = mockNext();
    guard(reqB, resB, nextB);
    expect(resB.status).toHaveBeenCalledWith(403);
    expect(nextB).not.toHaveBeenCalled();
  });

  it('COACH en gym A no tiene permisos de COACH en gym B', () => {
    const guard = requireGymRole('COACH');

    const req = mockReq();
    (req as GymScopedRequest).gymContext = { gymId: GYM_B, gymRoles: ['CLIENT'] };
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('multi-rol en gym A no otorga ningún rol en gym B', () => {
    const guard = requireGymRole('GYM_ADMIN', 'COACH');

    const req = mockReq();
    (req as GymScopedRequest).gymContext = { gymId: GYM_B, gymRoles: [] };
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('GYM_ADMIN no puede crear ejercicio si requireGymRole pide solo COACH', () => {
    const guard = requireGymRole('COACH');

    const req = mockReq();
    (req as GymScopedRequest).gymContext = { gymId: GYM_A, gymRoles: ['GYM_ADMIN'] };
    const res = mockRes();
    const next = mockNext();

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ═══════════════════════════════════════════════════════════
// 7. GetUserGymsUseCase — Solo gyms del usuario
// ═══════════════════════════════════════════════════════════

import { GetUserGymsUseCase } from '../users/application/use-cases/users/GetUserGymsUseCase';

describe('GetUserGymsUseCase — Aislamiento de datos', () => {
  it('usuario solo recibe sus propios gyms, no los de otros', async () => {
    const repo = makeRepo({
      findGymsByUserId: vi.fn().mockImplementation((userId: string) => {
        if (userId === USER_CLIENT_A) {
          return Promise.resolve([{ gymId: GYM_A, gymName: 'Gym A', roles: ['CLIENT'] }]);
        }
        return Promise.resolve([]);
      }),
    });

    const useCase = new GetUserGymsUseCase(repo);
    const resultA = await useCase.execute(USER_CLIENT_A);
    const resultB = await useCase.execute(USER_CLIENT_B);

    expect(resultA).toHaveLength(1);
    expect(resultA[0].gymId).toBe(GYM_A);
    expect(resultB).toHaveLength(0);
  });

  it('usuario con roles en múltiples gyms recibe todos', async () => {
    const repo = makeRepo({
      findGymsByUserId: vi.fn().mockResolvedValue([
        { gymId: GYM_A, gymName: 'Gym A', roles: ['CLIENT'] },
        { gymId: GYM_B, gymName: 'Gym B', roles: ['COACH'] },
      ]),
    });

    const useCase = new GetUserGymsUseCase(repo);
    const result = await useCase.execute('multi-gym-user');

    expect(result).toHaveLength(2);
    expect(result.map((g: any) => g.gymId)).toEqual([GYM_A, GYM_B]);
  });
});
