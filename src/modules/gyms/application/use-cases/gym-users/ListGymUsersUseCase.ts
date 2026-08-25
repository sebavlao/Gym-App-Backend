import type { IUserRepository } from '../../../../users/domain/repositories/IUserRepository';
import type { IGymRoleRepository } from '../../../domain/repositories/IGymRoleRepository';
import type { IMembershipRepository } from '../../../domain/repositories/IMembershipRepository';
import { User } from '../../../../users/domain/entities/User';

export interface ListGymUsersQuery {
  gymId: string;
  role: string;
  actorUserId?: string;
  actorRoles?: string[];
}

export class ListGymUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly gymRoleRepository: IGymRoleRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(query: ListGymUsersQuery): Promise<User[]> {
    const users = await this.userRepository.findUsersByGymAndRole(query.gymId, query.role);

    // Si el actor es COACH, filtrar solo clientes asignados a él
    if (query.actorRoles?.includes('COACH') && !query.actorRoles.includes('GYM_ADMIN') && query.role === 'CLIENT') {
      const assignedMemberships = await this.membershipRepository.findByGymIdAndCoachId(query.gymId, query.actorUserId!);
      const assignedUserIds = new Set(assignedMemberships.map(m => m.userId));
      return users.filter(u => assignedUserIds.has(u.id));
    }

    return users;
  }
}
