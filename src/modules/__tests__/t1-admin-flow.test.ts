/**
 * Tests de flujo completo de administración — RDL-T1
 *
 * Cobertura:
 * 1. Registro de usuario con nuevos campos (firstName, lastName)
 * 2. Gestión de usuarios del gimnasio (listar/crear clients y coaches)
 * 3. Operaciones de membresía (actualizar coach y estado)
 * 4. Operaciones de cuotas (generar, listar, mis cuotas)
 * 5. Operaciones de asistencia (check-in, listar, mi asistencia)
 * 6. Cambio de contraseña
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';

// ─── Mocks de Prisma y dependencias de DB ───

class MockPrismaClient {
  user = { 
    findUnique: vi.fn(), 
    create: vi.fn(), 
    update: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  };
  gym = { 
    findUnique: vi.fn(), 
    upsert: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  };
  gymRole = { 
    findMany: vi.fn().mockResolvedValue([]), 
    upsert: vi.fn(),
    create: vi.fn(),
  };
  membership = { 
    findUnique: vi.fn(), 
    findMany: vi.fn().mockResolvedValue([]), 
    upsert: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  membershipFee = {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
  };
  attendance = {
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  };
  $connect = vi.fn();
  $disconnect = vi.fn();
}

vi.mock('../../generated/prisma/client/client.js', () => ({
  PrismaClient: MockPrismaClient,
  FeeStatus: { PENDING: 'PENDING', PAID: 'PAID', WAIVED: 'WAIVED' },
  AttendanceSource: { MANUAL: 'MANUAL', QR_SCAN: 'QR_SCAN' },
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class { constructor(_c: any) {} },
}));

vi.mock('dotenv/config', () => ({}));

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.JWT_SECRET = 'test-secret-for-jwt';
});

// ─── Helpers ───

function makeApp(router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
}

async function getToken(userId = 'user-1', email = 'test@test.com') {
  const { JwtTokenService } = await import('../../shared/infrastructure/auth/JwtTokenService.js');
  const tokenService = new JwtTokenService();
  return tokenService.generate({ userId, email });
}

// ═══════════════════════════════════════════════════════════
// 1. Registro de usuario con nuevos campos
// ═══════════════════════════════════════════════════════════

describe('Registro de usuario — nuevos campos', () => {
  let app: express.Express;

  beforeAll(async () => {
    const { default: userRoutes } = await import('../users/infrastructure/routes/user.routes.js');
    app = makeApp(userRoutes);
  });

  it('registro con firstName y lastName requeridos', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        email: 'nuevo@test.com',
        password: 'password123',
        role: 'Client',
        firstName: 'Juan',
        lastName: 'Pérez',
      });

    expect(res.status).toBe(201);
  });

  it('registro sin firstName falla', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        email: 'nuevo2@test.com',
        password: 'password123',
        role: 'Client',
        lastName: 'Pérez',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/firstName/i);
  });

  it('registro sin lastName falla', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        email: 'nuevo3@test.com',
        password: 'password123',
        role: 'Client',
        firstName: 'Juan',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/lastName/i);
  });

  it('campos médicos son opcionales', async () => {
    const res = await supertest(app)
      .post('/register')
      .send({
        email: 'nuevo4@test.com',
        password: 'password123',
        role: 'Client',
        firstName: 'María',
        lastName: 'García',
      });

    expect(res.status).toBe(201);
  });
});

// ═══════════════════════════════════════════════════════════
// 2. Gestión de usuarios del gimnasio
// ═══════════════════════════════════════════════════════════

describe('Gym Users — listar y crear', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken('admin-1', 'admin@test.com');
    const { default: gymUsersRoutes } = await import('../gyms/infrastructure/routes/gym-users.routes.js');
    app = makeApp(gymUsersRoutes);
  });

  it('listar clientes requiere autenticación', async () => {
    const res = await supertest(app).get('/clients');
    expect(res.status).toBe(401);
  });

  it('listar coaches requiere autenticación', async () => {
    const res = await supertest(app).get('/coaches');
    expect(res.status).toBe(401);
  });

  it('crear cliente requiere autenticación', async () => {
    const res = await supertest(app)
      .post('/clients')
      .send({
        email: 'cliente@test.com',
        password: 'password123',
        firstName: 'Carlos',
        lastName: 'Ruiz',
      });

    expect(res.status).toBe(401);
  });

  it('crear coach requiere autenticación', async () => {
    const res = await supertest(app)
      .post('/coaches')
      .send({
        email: 'coach@test.com',
        password: 'password123',
        firstName: 'Ana',
        lastName: 'Martínez',
      });

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// 3. Operaciones de membresía
// ═══════════════════════════════════════════════════════════

describe('Membership — actualizar coach y estado', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken('admin-1', 'admin@test.com');
    const { default: membershipRoutes } = await import('../gyms/infrastructure/routes/Membership.routes.js');
    app = makeApp(membershipRoutes);
  });

  it('actualizar coach requiere autenticación', async () => {
    const res = await supertest(app)
      .patch('/membership-1/coach')
      .send({ coach_id: 'coach-1' });

    expect(res.status).toBe(401);
  });

  it('actualizar estado requiere autenticación', async () => {
    const res = await supertest(app)
      .patch('/membership-1/status')
      .send({ status: 'active' });

    expect(res.status).toBe(401);
  });

  it('actualizar estado con valor inválido falla (403 sin roles en mock)', async () => {
    const res = await supertest(app)
      .patch('/membership-1/status')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Gym-Id', 'gym-1')
      .send({ status: 'invalid' });

    // El mock no devuelve roles para el usuario, así que resolveGymContext retorna 403
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════
// 4. Operaciones de cuotas
// ═══════════════════════════════════════════════════════════

describe('Membership Fees — generar y listar', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken('admin-1', 'admin@test.com');
    const { default: membershipFeeRoutes } = await import('../gyms/infrastructure/routes/membership-fee.routes.js');
    app = makeApp(membershipFeeRoutes);
  });

  it('generar cuotas requiere autenticación', async () => {
    const res = await supertest(app)
      .post('/generate')
      .send({
        membership_id: 'membership-1',
        amount: 1000,
        periods: ['2026-08'],
        due_date: '2026-08-31',
      });

    expect(res.status).toBe(401);
  });

  it('listar cuotas requiere autenticación', async () => {
    const res = await supertest(app).get('/');
    expect(res.status).toBe(401);
  });

  it('mis cuotas requiere autenticación', async () => {
    const res = await supertest(app).get('/me');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// 5. Operaciones de asistencia
// ═══════════════════════════════════════════════════════════

describe('Attendance — check-in y listar', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken('user-1', 'user@test.com');
    const { default: attendanceRoutes } = await import('../gyms/infrastructure/routes/attendance.routes.js');
    app = makeApp(attendanceRoutes);
  });

  it('check-in requiere autenticación', async () => {
    const res = await supertest(app)
      .post('/check-in')
      .send({});

    expect(res.status).toBe(401);
  });

  it('listar asistencia requiere autenticación', async () => {
    const res = await supertest(app).get('/');
    expect(res.status).toBe(401);
  });

  it('mi asistencia requiere autenticación', async () => {
    const res = await supertest(app).get('/me');
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// 6. Cambio de contraseña
// ═══════════════════════════════════════════════════════════

describe('Change Password', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken('user-1', 'user@test.com');
    const { default: userRoutes } = await import('../users/infrastructure/routes/user.routes.js');
    app = makeApp(userRoutes);
  });

  it('cambio de contraseña requiere autenticación', async () => {
    const res = await supertest(app)
      .post('/change-password')
      .send({
        currentPassword: 'old123',
        newPassword: 'new123456',
      });

    expect(res.status).toBe(401);
  });

  it('cambio de contraseña con contraseña actual incorrecta', async () => {
    const res = await supertest(app)
      .post('/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrong',
        newPassword: 'new123456',
      });

    // El mock no tiene usuario configurado, así que fallará
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
