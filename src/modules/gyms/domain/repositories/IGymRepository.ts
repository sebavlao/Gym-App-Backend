import type { Gym } from '../../../../generated/prisma/client/client.js';

export interface GymRepository {
  create(data: { name: string; address: string }): Promise<Gym>;
  findAll(): Promise<Gym[]>;
  findById(id: string): Promise<Gym | null>;
}