import express from 'express';
// @ts-ignore
import { PrismaClient } from './generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { exerciseRoutes } from './infrastructure/routes/exercise.routes.js';
import userRoutes from './modules/users/infrastructure/routes/user.routes.js';
import { gymRoutes } from './infrastructure/routes/gym.routes.js';
import { routineRoutes } from './infrastructure/routes/routine.routes.js'; 
import { trainingLogRoutes } from './infrastructure/routes/training-log.routes.js';

import MembershipRoutes from './modules/gyms/infrastructure/routes/Membership.routes.js';

const connectionString = process.env.DATABASE_URL;

const app = express();
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/exercises', exerciseRoutes);
app.use('/users', userRoutes);
app.use('/gyms', gymRoutes);
app.use('/memberships', MembershipRoutes);
app.use('/routines', routineRoutes);
app.use('/training-logs', trainingLogRoutes);

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