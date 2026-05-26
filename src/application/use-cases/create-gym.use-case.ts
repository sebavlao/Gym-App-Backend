import type { GymRepository } from '../../domain/repositories/gym.repository.js';
import type { Gym } from '../../generated/prisma/client/client.js';

interface CreateGymInput {
  name: string;
  address: string;
}

export class CreateGymUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(input: CreateGymInput): Promise<Gym> {
    if (!input.name.trim() || !input.address.trim()) {
      throw new Error('El nombre y la dirección del gimnasio son obligatorios.');
    }
    return this.gymRepository.create(input);
  }
}