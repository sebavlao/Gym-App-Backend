import { MembershipFee } from '../entities/MembershipFee';

export interface IMembershipFeeRepository {
  findById(id: string): Promise<MembershipFee | null>;
  findByMembershipId(membershipId: string): Promise<MembershipFee[]>;
  findByUserId(userId: string): Promise<MembershipFee[]>;
  findByGymId(gymId: string): Promise<MembershipFee[]>;
  save(fee: MembershipFee): Promise<void>;
  update(fee: MembershipFee): Promise<void>;
}
