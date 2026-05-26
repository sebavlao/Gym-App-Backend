import type { GymRepository } from '../../domain/repositories/gym.repository.js';
import type { Gym } from '../../generated/prisma/client/client.js';

export class GetGymsUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(): Promise<Gym[]> {
    return this.gymRepository.findAll();
  }
}