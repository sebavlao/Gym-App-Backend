import 'dotenv/config';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { User, Role } from '../../generated/prisma/client/client.js';
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaUserRepository implements UserRepository {
  async create(data: {
    email: string;
    password_hash: string;
    role: Role;
  }): Promise<User> {
    
    const userCreationData: any = {
      email: data.email,
      password: data.password_hash, // Columna real: 'password'
      role: data.role,
    };

    // Usamos los nombres exactos del schema: clientDetail y coachDetail
    if (data.role === 'Client') {
      userCreationData.clientDetail = {
        create: {} // Crea la ficha médica vacía vinculada automáticamente
      };
    } else if (data.role === 'Coach') {
      userCreationData.coachDetail = {
        create: {} // Crea el perfil de profesor vacío vinculado automáticamente
      };
    }

    return localPrisma.user.create({
      data: userCreationData,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return localPrisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return localPrisma.user.findUnique({
      where: { id },
    });
  }
}