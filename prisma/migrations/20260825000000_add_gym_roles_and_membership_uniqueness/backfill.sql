-- ============================================================
-- DOCUMENTACIÓN — Backfill integrado en migration.sql
-- ============================================================
-- Este archivo NO es ejecutado por Prisma.
-- El SQL completo está integrado en migration.sql (PASO 5a/5b).
-- Se mantiene como documentación de referencia.
-- ============================================================

-- PREFLIGHT (ejecutar manualmente antes de migrar):
-- Verificar duplicados de Membership:
-- SELECT user_id, gym_id, COUNT(*) AS cnt
-- FROM "Membership"
-- GROUP BY user_id, gym_id
-- HAVING COUNT(*) > 1;
--
-- Verificar Admins existentes (quedarán sin GymRole):
-- SELECT id, email, role FROM "User" WHERE role = 'Admin';

-- CLIENT desde Membership:
INSERT INTO "GymRole" ("id", "user_id", "gym_id", "role", "created_at")
SELECT gen_random_uuid()::text, m.user_id, m.gym_id, 'CLIENT'::"GymRoleType", NOW()
FROM "Membership" m
WHERE NOT EXISTS (SELECT 1 FROM "GymRole" gr WHERE gr.user_id = m.user_id AND gr.gym_id = m.gym_id AND gr.role = 'CLIENT')
ON CONFLICT DO NOTHING;

-- COACH desde coach_id en Membership:
INSERT INTO "GymRole" ("id", "user_id", "gym_id", "role", "created_at")
SELECT gen_random_uuid()::text, m.coach_id, m.gym_id, 'COACH'::"GymRoleType", NOW()
FROM "Membership" m
WHERE m.coach_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "GymRole" gr WHERE gr.user_id = m.coach_id AND gr.gym_id = m.gym_id AND gr.role = 'COACH')
ON CONFLICT DO NOTHING;
