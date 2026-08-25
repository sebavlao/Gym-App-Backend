import type { IGymRoleRepository } from '../../../../gyms/domain/repositories/IGymRoleRepository.js';

export interface UserGym {
  gymId: string;
  gym: {
    id: string;
    name: string;
  };
  roles: string[];
}

export class GetUserGymsUseCase {
  constructor(private readonly gymRoleRepository: IGymRoleRepository) {}

  async execute(userId: string): Promise<UserGym[]> {
    const gymRoles = await this.gymRoleRepository.findGymsByUserId(userId);

    return gymRoles.map(gr => ({
      gymId: gr.gymId,
      gym: {
        id: gr.gymId,
        name: gr.gymName,
      },
      roles: gr.roles,
    }));
  }
}
