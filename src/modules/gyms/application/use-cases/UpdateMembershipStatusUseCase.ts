import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { MembershipStatus } from '../../domain/entities/Membership';

export interface UpdateMembershipStatusCommand {
  membershipId: string;
  status: MembershipStatus;
}

export class UpdateMembershipStatusUseCase {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  async execute(command: UpdateMembershipStatusCommand): Promise<void> {
    const membership = await this.membershipRepository.findById(
      command.membershipId,
    );
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (command.status === MembershipStatus.Active) {
      membership.activate();
    } else if (command.status === MembershipStatus.Inactive) {
      membership.deactivate();
    } else {
      throw new Error('Can only transition to active or inactive explicitly');
    }

    await this.membershipRepository.update(membership);
  }
}
