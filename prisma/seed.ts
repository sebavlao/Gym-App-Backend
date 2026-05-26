import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Empezando el sembrado de datos reales...');

  await prisma.exercise.createMany({
    data: [
      {
        name: 'Remo con Mancuerna',
        muscle_group: 'Espalda'
      },
      {
        name: 'Hip Thrust',
        muscle_group: 'Piernas'
      },
      {
        name: 'Press de Banca',
        muscle_group: 'Pecho'
      }
    ],
  });

  console.log('✅ Base de datos sembrada con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });