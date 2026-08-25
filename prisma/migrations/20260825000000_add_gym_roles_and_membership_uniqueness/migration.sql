-- ============================================================
-- Migración: GymRole + Membership @@unique
-- Archivo: 20260825000000_add_gym_roles_and_membership_uniqueness
-- ============================================================
-- Nota: El backfill se integra aquí porque Prisma solo ejecuta
-- migration.sql. El archivo backfill.sql es documentación.
-- ============================================================

-- PASO 1: Crear enum GymRoleType
-- CreateEnum
CREATE TYPE "GymRoleType" AS ENUM ('GYM_ADMIN', 'COACH', 'CLIENT');

-- PASO 2: Crear tabla GymRole
-- CreateTable
CREATE TABLE "GymRole" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "role" "GymRoleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymRole_pkey" PRIMARY KEY ("id")
);

-- PASO 3: Índices únicos para GymRole
-- CreateIndex
CREATE UNIQUE INDEX "GymRole_user_id_gym_id_role_key" ON "GymRole"("user_id", "gym_id", "role");

-- PASO 4: Foreign keys (antes del backfill, porque inserta en GymRole)
-- AddForeignKey
ALTER TABLE "GymRole" ADD CONSTRAINT "GymRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymRole" ADD CONSTRAINT "GymRole_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- PASO 5: BACKFILL — Poblar GymRole desde datos existentes
-- ============================================================
-- Nota: Con DB vacía (piloto), estos INSERTs no insertan filas.
-- Se mantienen para que la migración sea autocontenida.
-- No se crea GYM_ADMIN automáticamente (no hay mapeo Admin→Gym).
-- ============================================================

-- PASO 5a: CLIENT para cada alumno en Membership
INSERT INTO "GymRole" ("id", "user_id", "gym_id", "role", "created_at")
SELECT
  gen_random_uuid()::text,
  m.user_id,
  m.gym_id,
  'CLIENT'::"GymRoleType",
  NOW()
FROM "Membership" m
WHERE NOT EXISTS (
  SELECT 1 FROM "GymRole" gr
  WHERE gr.user_id = m.user_id
    AND gr.gym_id = m.gym_id
    AND gr.role = 'CLIENT'
)
ON CONFLICT DO NOTHING;

-- PASO 5b: COACH para cada coach asignado en Membership
INSERT INTO "GymRole" ("id", "user_id", "gym_id", "role", "created_at")
SELECT
  gen_random_uuid()::text,
  m.coach_id,
  m.gym_id,
  'COACH'::"GymRoleType",
  NOW()
FROM "Membership" m
WHERE m.coach_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "GymRole" gr
    WHERE gr.user_id = m.coach_id
      AND gr.gym_id = m.gym_id
      AND gr.role = 'COACH'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASO 6: Único Membership — AL FINAL
-- Si existen duplicados (user_id, gym_id), esta línea FALLA.
-- Esto es correcto: fuerza resolución manual antes de migrar.
-- ============================================================
-- CreateIndex
CREATE UNIQUE INDEX "Membership_user_id_gym_id_key" ON "Membership"("user_id", "gym_id");
