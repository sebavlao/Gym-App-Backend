import type { IUserRepository } from '../../../../users/domain/repositories/IUserRepository';
import type { IMembershipRepository } from '../../../domain/repositories/IMembershipRepository';
import type { IGymRoleRepository } from '../../../domain/repositories/IGymRoleRepository';
import { User, UserRole } from '../../../../users/domain/entities/User';
import { BcryptHasher } from '../../../../../shared/infrastructure/cryptography/BcryptHasher';

export interface CreateGymUserCommand {
  gymId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'COACH';
  // Medical fields (optional)
  bloodType?: string;
  pathologies?: string;
  allergies?: string;
  emergencyContact?: string;
  observations?: string;
}

export interface CreateGymUserResult {
  user: User;
  isNew: boolean;
}

export class CreateGymUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly gymRoleRepository: IGymRoleRepository,
    private readonly hasher: BcryptHasher,
  ) {}

  async execute(command: CreateGymUserCommand): Promise<CreateGymUserResult> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(command.email);
    
    let user: User;
    let isNew = false;
    
    if (existingUser) {
      // Si el usuario ya existe, solo asignar el rol en el gimnasio
      user = existingUser;
    } else {
      // Crear nuevo usuario
      isNew = true;
      const hashedPassword = await this.hasher.hash(command.password);
      
      const userRole = command.role === 'CLIENT' ? UserRole.Client : UserRole.Coach;
      
      user = User.create({
        id: crypto.randomUUID(),
        email: command.email,
        password: hashedPassword,
        role: userRole,
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
      });
      
      await this.userRepository.save(user);
    }
    
    // Asignar rol en el gimnasio
    await this.gymRoleRepository.create(user.id, command.gymId, command.role);
    
    // Si es cliente, crear membresía
    if (command.role === 'CLIENT') {
      await this.membershipRepository.save({
        id: crypto.randomUUID(),
        userId: user.id,
        gymId: command.gymId,
        status: 'active',
      } as any);
    }
    
    return { user, isNew };
  }
}
