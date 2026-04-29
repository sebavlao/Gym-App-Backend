import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { BcryptHasher } from '../../../../../shared/infrastructure/cryptography/BcryptHasher';
import { JwtTokenService } from '../../../../../shared/infrastructure/auth/JwtTokenService';
import {
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../../../../shared/domain/errors/DomainError';

export interface LoginUserCommand {
  email: string;
  passwordRaw: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: BcryptHasher,
    private readonly tokenService: JwtTokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.password) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.hasher.compare(
      command.passwordRaw,
      user.password,
    );
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
