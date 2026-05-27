import 'dotenv/config';
import type { MembershipRepository } from '../../domain/repositories/membership.repository.js';
import type { Membership } from '../../generated/prisma/client/client.js';
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaMembershipRepository implements MembershipRepository {
  async create(data: {
    user_id: string;
    gym_id: string;
    coach_id?: string | null;
    status: string;
  }): Promise<Membership> {
    return localPrisma.membership.create({
      data: {
        user_id: data.user_id,
        gym_id: data.gym_id,
        coach_id: data.coach_id ?? null,
        status: data.status,
      },
    });
  }

  async findByUserId(user_id: string): Promise<Membership[]> {
    return localPrisma.membership.findMany({
      where: { user_id },
    });
  }

  async findById(id: string): Promise<Membership | null> {
    return localPrisma.membership.findUnique({
      where: { id },
    });
  }
}