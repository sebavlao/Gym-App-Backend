import { Router } from 'express';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaAttendanceRepository } from '../persistence/PrismaAttendanceRepository.js';
import { PrismaMembershipRepository } from '../persistence/PrismaMembershipRepository.js';
import { PrismaGymRoleRepository } from '../persistence/PrismaGymRoleRepository.js';
import { CheckInUseCase } from '../../application/use-cases/CheckInUseCase.js';
import { ListAttendanceUseCase } from '../../application/use-cases/ListAttendanceUseCase.js';
import { GetUserAttendanceUseCase } from '../../application/use-cases/GetUserAttendanceUseCase.js';
import { AttendanceController } from '../controllers/AttendanceController.js';
import { authenticate } from '../../../../shared/infrastructure/middleware/authenticate.js';
import { resolveGymContext } from '../../../../shared/infrastructure/middleware/resolveGymContext.js';
import { requireGymRole } from '../../../../shared/infrastructure/middleware/requireGymRole.js';

const router = Router();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const attendanceRepository = new PrismaAttendanceRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const gymRoleRepository = new PrismaGymRoleRepository(prisma);

const checkInUseCase = new CheckInUseCase(attendanceRepository, membershipRepository);
const listAttendanceUseCase = new ListAttendanceUseCase(attendanceRepository, membershipRepository);
const getUserAttendanceUseCase = new GetUserAttendanceUseCase(attendanceRepository);

const controller = new AttendanceController(checkInUseCase, listAttendanceUseCase, getUserAttendanceUseCase, membershipRepository);

// Check-in (GYM_ADMIN y COACH, NO CLIENT)
router.post('/check-in', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.checkIn(req, res));

// Listar asistencia del gimnasio (GYM_ADMIN y COACH, con filtros)
router.get('/', authenticate, resolveGymContext(gymRoleRepository), requireGymRole('GYM_ADMIN', 'COACH'), (req, res) => controller.list(req, res));

// Mi asistencia (cualquier usuario autenticado, gimnasio-scoped)
router.get('/me', authenticate, resolveGymContext(gymRoleRepository), (req, res) => controller.me(req, res));

export default router;
