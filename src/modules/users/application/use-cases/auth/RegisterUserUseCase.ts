import { User, UserRole } from '../../../domain/entities/User';
import { ClientDetail } from '../../../domain/entities/ClientDetail';
import { CoachDetail } from '../../../domain/entities/CoachDetail';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { BcryptHasher } from '../../../../../shared/infrastructure/cryptography/BcryptHasher';

export interface RegisterUserCommand {
  id: string;
  email: string;
  passwordRaw: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  // Medical fields for client (optional)
  bloodType?: string;
  pathologies?: string;
  allergies?: string;
  emergencyContact?: string;
  observations?: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: BcryptHasher,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hasher.hash(command.passwordRaw);

    let clientDetail: ClientDetail | undefined;
    let coachDetail: CoachDetail | undefined;

    if (command.role === UserRole.Client) {
      clientDetail = ClientDetail.create({
        id: crypto.randomUUID(),
        userId: command.id,
        bloodType: command.bloodType,
        pathologies: command.pathologies,
        emergencyContact: command.emergencyContact,
        allergies: command.allergies,
        observations: command.observations,
      });
    } else if (command.role === UserRole.Coach) {
      coachDetail = CoachDetail.create({
        id: crypto.randomUUID(),
        userId: command.id,
        bloodType: command.bloodType,
        pathologies: command.pathologies,
        allergies: command.allergies,
        observations: command.observations,
        emergencyContact: command.emergencyContact,
      });
    }

    const user = User.create({
      id: command.id,
      email: command.email,
      password: hashedPassword,
      role: command.role,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      clientDetail,
      coachDetail,
    });

    await this.userRepository.save(user);
  }
}
