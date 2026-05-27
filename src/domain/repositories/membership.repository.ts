import type { Membership } from '../../generated/prisma/client/client.js';

export interface MembershipRepository {
  create(data: {
    user_id: string;
    gym_id: string;
    coach_id?: string | null;
    status: string;
  }): Promise<Membership>;
  
  findByUserId(user_id: string): Promise<Membership[]>;
  findById(id: string): Promise<Membership | null>;
}