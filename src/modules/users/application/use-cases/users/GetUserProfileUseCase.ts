import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { User } from '../../../domain/entities/User';
import { UserNotFoundError } from '../../../../../shared/domain/errors/DomainError';

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }
}
