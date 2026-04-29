import { Membership } from '../entities/Membership';

export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByUserId(userId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  update(membership: Membership): Promise<void>;
}
