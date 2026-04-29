import { User, UserRole } from '../../domain/entities/User';
import { ClientDetail } from '../../domain/entities/ClientDetail';
import { CoachDetail } from '../../domain/entities/CoachDetail';
import type {
  Prisma,
  User as PrismaUser,
} from '../../../../generated/prisma/client/client';

// Prisma interfaces mocked since we might not have the fully generated types at hand
// In a real scenario, this would be imported from the generated prisma client
type PrismaUserWithDetails = Prisma.UserGetPayload<{
  include: {
    clientDetail: true;
    coachDetail: true;
  };
}>;

export class UserMapper {
  static toDomain(prismaUser: PrismaUserWithDetails): User {
    let clientDetail: ClientDetail | undefined;
    if (prismaUser.clientDetail) {
      clientDetail = ClientDetail.create({
        id: prismaUser.clientDetail.id,
        userId: prismaUser.clientDetail.user_id,
        bloodType: prismaUser.clientDetail.blood_type || '',
        pathologies: prismaUser.clientDetail.pathologies || '',
        emergencyContact: prismaUser.clientDetail.emergency_contact || '',
        allergies: prismaUser.clientDetail.allergies,
        observations: prismaUser.clientDetail.observations,
      });
    }

    let coachDetail: CoachDetail | undefined;
    if (prismaUser.coachDetail) {
      coachDetail = CoachDetail.create({
        id: prismaUser.coachDetail.id,
        userId: prismaUser.coachDetail.user_id,
        bloodType: prismaUser.coachDetail.blood_type,
        pathologies: prismaUser.coachDetail.pathologies,
        allergies: prismaUser.coachDetail.allergies,
        observations: prismaUser.coachDetail.observations,
        emergencyContact: prismaUser.coachDetail.emergency_contact,
      });
    }

    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      role: prismaUser.role as UserRole,
      qrCode: prismaUser.qr_code,
      clientDetail,
      coachDetail,
    });
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id,
      email: user.email,
      password: user.password as string,
      role: user.role,
      qr_code: user.qrCode || '',
    };
  }
}
