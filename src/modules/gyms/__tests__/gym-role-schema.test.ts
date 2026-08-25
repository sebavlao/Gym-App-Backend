/**
 * Tests focales del modelo GymRole y unicidad de Membership.
 *
 * Estos tests verifican la ESTRUCTURA del modelo generado por Prisma,
 * no operaciones contra base de datos (DB no accesible en este bloque).
 *
 * Cobertura:
 * 1. GymRoleType enum tiene los valores correctos
 * 2. GymRole model tiene los campos esperados
 * 3. Membership tiene unique compuesto user_id_gym_id
 * 4. GymRole tiene unique compuesto user_id_gym_id_role
 * 5. User tiene relación gymRoles
 * 6. Gym tiene relación gymRoles
 */
import fs from 'node:fs';
import path from 'node:path';
import { GymRoleType, Role } from '../../../generated/prisma/client/enums';
import { describe, it, expect } from 'vitest';

const schemaPath = path.resolve(__dirname, '../../../../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

describe('GymRoleType enum', () => {
  it('contiene GYM_ADMIN, COACH y CLIENT', () => {
    expect(GymRoleType.GYM_ADMIN).toBe('GYM_ADMIN');
    expect(GymRoleType.COACH).toBe('COACH');
    expect(GymRoleType.CLIENT).toBe('CLIENT');
  });

  it('tiene exactamente 3 valores', () => {
    const values = Object.values(GymRoleType);
    expect(values).toHaveLength(3);
    expect(values).toEqual(
      expect.arrayContaining(['GYM_ADMIN', 'COACH', 'CLIENT'])
    );
  });
});

describe('Role legacy', () => {
  it('permanece intacto con Admin, Coach, Client', () => {
    expect(Role.Admin).toBe('Admin');
    expect(Role.Coach).toBe('Coach');
    expect(Role.Client).toBe('Client');
    expect(Object.values(Role)).toHaveLength(3);
  });
});

describe('Modelo GymRole — estructura TypeScript', () => {
  it('GymRoleType es un enum constante exportado correctamente', () => {
    type GymRoleValues = typeof GymRoleType[keyof typeof GymRoleType];
    const testVal: GymRoleValues = 'GYM_ADMIN';
    expect(testVal).toBe('GYM_ADMIN');
  });

  it('Los valores de GymRoleType son strings literales', () => {
    expect(typeof GymRoleType.GYM_ADMIN).toBe('string');
    expect(typeof GymRoleType.COACH).toBe('string');
    expect(typeof GymRoleType.CLIENT).toBe('string');
  });
});

describe('Modelo Membership — unique compuesto', () => {
  it('la definición del schema incluye @@unique([user_id, gym_id])', () => {
    const membershipSection = schema.split('model Membership')[1]?.split('model ')[0] ?? '';
    expect(membershipSection).toContain('@@unique([user_id, gym_id])');
  });
});

describe('Modelo GymRole — definición en schema', () => {
  it('existe el modelo GymRole en el schema', () => {
    expect(schema).toContain('model GymRole {');
  });

  it('GymRole tiene @@unique([user_id, gym_id, role])', () => {
    const gymRoleSection = schema.split('model GymRole')[1]?.split('model ')[0] ?? '';
    expect(gymRoleSection).toContain('@@unique([user_id, gym_id, role])');
  });

  it('GymRole tiene FK a User y Gym', () => {
    const gymRoleSection = schema.split('model GymRole')[1]?.split('model ')[0] ?? '';
    expect(gymRoleSection).toContain('user_id String');
    expect(gymRoleSection).toContain('gym_id  String');
    expect(gymRoleSection).toContain('role    GymRoleType');
  });

  it('User tiene relación gymRoles GymRole[]', () => {
    const userSection = schema.split('model User')[1]?.split('model ')[0] ?? '';
    expect(userSection).toContain('gymRoles GymRole[]');
  });

  it('Gym tiene relación gymRoles GymRole[]', () => {
    const gymSection = schema.split('model Gym')[1]?.split('model ')[0] ?? '';
    expect(gymSection).toContain('gymRoles    GymRole[]');
  });
});

describe('Casos de uso modelados — cardinalidades', () => {
  it('un usuario puede tener múltiples GymRole (multi-gym)', () => {
    const gymRoleSection = schema.split('model GymRole')[1]?.split('model ')[0] ?? '';
    const userIdLine = gymRoleSection.split('\n').find(l => l.includes('user_id')) ?? '';
    expect(userIdLine).not.toContain('@unique');
  });

  it('un usuario puede tener múltiples roles en el mismo gym', () => {
    const gymRoleSection = schema.split('model GymRole')[1]?.split('model ')[0] ?? '';
    expect(gymRoleSection).toContain('@@unique([user_id, gym_id, role])');
    expect(gymRoleSection).not.toMatch(/@@unique\(\[user_id, gym_id\]\)\s*$/m);
  });

  it('Membership impide duplicados por (user_id, gym_id)', () => {
    const membershipSection = schema.split('model Membership')[1]?.split('model ')[0] ?? '';
    expect(membershipSection).toContain('@@unique([user_id, gym_id])');
  });
});
