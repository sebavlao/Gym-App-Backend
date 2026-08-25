export interface GymRoleWithGym {
  gymId: string;
  gymName: string;
  roles: string[];
}

export interface IGymRoleRepository {
  findGymsByUserId(userId: string): Promise<GymRoleWithGym[]>;
  findRolesByUserAndGym(userId: string, gymId: string): Promise<string[]>;
  create(userId: string, gymId: string, role: string): Promise<void>;
}
