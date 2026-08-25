import { Membership } from '../entities/Membership';

export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByUserId(userId: string): Promise<Membership[]>;
  findByGymId(gymId: string): Promise<Membership[]>;
  findByGymIdAndCoachId(gymId: string, coachId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  update(membership: Membership): Promise<void>;
}
