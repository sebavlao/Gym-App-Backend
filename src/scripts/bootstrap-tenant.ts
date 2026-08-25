import { PrismaClient } from '../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { BcryptHasher } from '../shared/infrastructure/cryptography/BcryptHasher.js';

const requiredEnvVars = [
  'DATABASE_URL',
  'BOOTSTRAP_GYM_NAME',
  'BOOTSTRAP_GYM_ADDRESS',
  'BOOTSTRAP_ADMIN_FIRST_NAME',
  'BOOTSTRAP_ADMIN_LAST_NAME',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_PASSWORD',
] as const;

function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function bootstrap() {
  validateEnv();

  const gymName = process.env.BOOTSTRAP_GYM_NAME!;
  const gymAddress = process.env.BOOTSTRAP_GYM_ADDRESS!;
  const adminFirstName = process.env.BOOTSTRAP_ADMIN_FIRST_NAME!;
  const adminLastName = process.env.BOOTSTRAP_ADMIN_LAST_NAME!;
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL!;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD!;

  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const hasher = new BcryptHasher();

  try {
    console.log('Iniciando bootstrap del tenant...\n');

    const gym = await prisma.gym.create({
      data: {
        name: gymName,
        address: gymAddress,
      },
    });
    console.log(`Gimnasio creado: ${gym.name} (${gym.id})`);

    const hashedPassword = await hasher.hash(adminPassword);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        first_name: adminFirstName,
        last_name: adminLastName,
      },
    });
    console.log(`Admin creado: ${admin.email} (${admin.id})`);

    await prisma.gymRole.create({
      data: {
        user_id: admin.id,
        gym_id: gym.id,
        role: 'GYM_ADMIN',
      },
    });
    console.log(`Rol GYM_ADMIN asignado a ${admin.email}`);

    console.log('\nBootstrap completado exitosamente.');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('El recurso ya existe. El bootstrap es idempotent pero este registro ya fue creado.');
    } else {
      console.error('Error durante el bootstrap:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();
