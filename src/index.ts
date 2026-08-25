import express from 'express';
// @ts-ignore
import { PrismaClient } from './generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

// Nuevas rutas modulares conectadas a sus ubicaciones reales
import { exerciseRoutes } from './modules/workouts/infrastructure/routes/exercise.routes.js';
import { routineRoutes } from './modules/workouts/infrastructure/routes/routine.routes.js'; 
import { trainingLogRoutes } from './modules/workouts/infrastructure/routes/training-log.routes.js';
import { gymRoutes } from './modules/gyms/infrastructure/routes/gym.routes.js';
import MembershipRoutes from './modules/gyms/infrastructure/routes/Membership.routes.js';
import gymUsersRoutes from './modules/gyms/infrastructure/routes/gym-users.routes.js';
import membershipFeeRoutes from './modules/gyms/infrastructure/routes/membership-fee.routes.js';
import attendanceRoutes from './modules/gyms/infrastructure/routes/attendance.routes.js';
import userRoutes from './modules/users/infrastructure/routes/user.routes.js';
import billingRoutes from './modules/billing/infrastructure/routes/billing.routes.js';
import nutritionRoutes from './modules/users/infrastructure/routes/nutrition.routes.js'; 

const connectionString = process.env.DATABASE_URL!;

const app = express();
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Despachadores mapeados a las nuevas rutas
app.use('/exercises', exerciseRoutes);
app.use('/users', userRoutes);
app.use('/gyms', gymRoutes);
app.use('/memberships', MembershipRoutes);
app.use('/gym-users', gymUsersRoutes);
app.use('/membership-fees', membershipFeeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/routines', routineRoutes);
app.use('/training-logs', trainingLogRoutes);
app.use('/billing', billingRoutes);
app.use('/nutrition', nutritionRoutes); // <-- Registramos el módulo de Cami

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida con éxito.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

app.get('/', (req, res) => {
  res.send('Servidor y Base de Datos activos 🚀');
});