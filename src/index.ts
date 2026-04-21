import express from 'express';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const app = express();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
