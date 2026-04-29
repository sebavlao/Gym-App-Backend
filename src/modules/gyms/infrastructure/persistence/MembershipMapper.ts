import type {
  Prisma,
  Membership as PrismaMembership,
} from '../../../../generated/prisma/client/browser';
import { Membership, MembershipStatus } from '../../domain/entities/Membership';

type PrismaMembershipDetails = Prisma.MembershipGetPayload<{
  include: {
    user: true;
    gym: true;
    coach: true;
  };
}>;

export class MembershipMapper {
  static toDomain(
    prismaMembershipDetails: PrismaMembershipDetails,
  ): Membership {
    return Membership.create({
      id: prismaMembershipDetails.id,
      userId: prismaMembershipDetails.user_id,
      gymId: prismaMembershipDetails.gym_id,
      coachId: prismaMembershipDetails.coach_id,
      status: prismaMembershipDetails.status as MembershipStatus,
    });
  }

  static toPersistence(membership: Membership): PrismaMembership {
    return {
      id: membership.id,
      user_id: membership.userId,
      gym_id: membership.gymId,
      coach_id: membership.coachId || null,
      status: membership.status,
    };
  }
}
