import type { UserRepository } from '../../domain/repositories/user.repository.js';
import type { User, Role } from '../../generated/prisma/client/client.js';

interface RegisterUserInput {
  email: string;
  password_hash: string;
  role: Role;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('El email ya se encuentra registrado en el sistema.');
    }

    return this.userRepository.create(input);
  }
}