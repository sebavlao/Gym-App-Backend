/**
 * Tests de seguridad post-QA — RDL-T0.3B cierre
 *
 * Verifica que las 3 exposiciones residuales quedan bloqueadas:
 * 1. POST /gyms → 501 (creación deshabilitada)
 * 2. GET /memberships/:id/qr y POST /memberships/:id/validate → 501
 * 3. Todas las rutas de nutrition → 501 (con authenticate previo)
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';

// ─── Mocks de Prisma y dependencias de DB ───

class MockPrismaClient {
  gym = { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]) };
  membership = { findUnique: vi.fn(), findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() };
  gymRole = { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() };
  mealPlan = { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  user = { findUnique: vi.fn(), create: vi.fn() };
  $connect = vi.fn();
  $disconnect = vi.fn();
}

vi.mock('../../generated/prisma/client/client.js', () => ({
  PrismaClient: MockPrismaClient,
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

async function getToken() {
  const { JwtTokenService } = await import('../../shared/infrastructure/auth/JwtTokenService.js');
  const tokenService = new JwtTokenService();
  return tokenService.generate({ userId: 'user-1', email: 'test@test.com' });
}

// ═══════════════════════════════════════════════════════════
// 1. POST /gyms deshabilitado
// ═══════════════════════════════════════════════════════════

describe('POST /gyms — deshabilitado temporalmente', () => {
  let app: express.Express;

  beforeAll(async () => {
    const { gymRoutes } = await import('../gyms/infrastructure/routes/gym.routes.js');
    app = makeApp(gymRoutes);
  });

  it('con token válido retorna 501', async () => {
    const token = await getToken();
    const res = await supertest(app)
      .post('/')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Gym Test' });

    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/no disponible temporalmente/i);
  });

  it('sin token retorna 401 (authenticate sigue activo)', async () => {
    const res = await supertest(app)
      .post('/')
      .send({ name: 'Gym Test' });

    expect(res.status).toBe(401);
  });

  it('GET /gyms sigue público', async () => {
    const res = await supertest(app).get('/');

    expect(res.status).not.toBe(501);
    expect(res.status).not.toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// 2. Membership QR/validate deshabilitados
// ═══════════════════════════════════════════════════════════

describe('Membership QR/validate — deshabilitados temporalmente', () => {
  let app: express.Express;

  beforeAll(async () => {
    const { default: membershipRoutes } = await import('../gyms/infrastructure/routes/Membership.routes.js');
    app = makeApp(membershipRoutes);
  });

  it('GET /:id/qr retorna 501 sin autenticación', async () => {
    const res = await supertest(app).get('/any-id/qr');

    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/no disponible temporalmente/i);
  });

  it('POST /:id/validate retorna 501 sin autenticación', async () => {
    const res = await supertest(app)
      .post('/any-id/validate')
      .send({});

    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/no disponible temporalmente/i);
  });

  it('POST / sin auth retorna 401 (create sigue protegido)', async () => {
    const res = await supertest(app)
      .post('/')
      .send({ user_id: 'u1' });

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// 3. Nutrition rutas sensibles deshabilitadas
// ═══════════════════════════════════════════════════════════

describe('Nutrition — rutas sensibles deshabilitadas temporalmente', () => {
  let app: express.Express;
  let token: string;

  beforeAll(async () => {
    token = await getToken();
    const { default: nutritionRoutes } = await import('../users/infrastructure/routes/nutrition.routes.js');
    app = makeApp(nutritionRoutes);
  });

  it('POST /plan sin token → 401', async () => {
    const res = await supertest(app).post('/plan').send({});
    expect(res.status).toBe(401);
  });

  it('POST /plan con token → 501', async () => {
    const res = await supertest(app)
      .post('/plan')
      .set('Authorization', `Bearer ${token}`)
      .send({ client_id: 'c1', title: 'Plan', meals: [] });

    expect(res.status).toBe(501);
    expect(res.body.error).toMatch(/no disponible temporalmente/i);
  });

  it('PUT /plan/:id con token → 501', async () => {
    const res = await supertest(app)
      .put('/plan/any-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(501);
  });

  it('GET /client/:clientId con token → 501', async () => {
    const res = await supertest(app)
      .get('/client/any-client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(501);
  });

  it('GET /plan/:id con token → 501', async () => {
    const res = await supertest(app)
      .get('/plan/any-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(501);
  });

  it('DELETE /plan/:id con token → 501', async () => {
    const res = await supertest(app)
      .delete('/plan/any-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(501);
  });

  it('GET /client/:clientId sin token → 401', async () => {
    const res = await supertest(app).get('/client/any-client');
    expect(res.status).toBe(401);
  });
});
