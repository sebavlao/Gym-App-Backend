import type { User, Role } from '../../generated/prisma/client/client.js';

export interface UserRepository {
  create(data: {
    email: string;
    password_hash: string;
    role: Role;
  }): Promise<User>;
  
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}