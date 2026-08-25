import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { Attendance } from '../../domain/entities/Attendance';

export interface ListAttendanceQuery {
  gymId: string;
  from?: Date;
  to?: Date;
  clientId?: string;
  actorUserId?: string;
  actorRoles?: string[];
}

export class ListAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(query: ListAttendanceQuery): Promise<Attendance[]> {
    let attendances = await this.attendanceRepository.findByGymId(query.gymId);

    // COACH solo ve asistencia de sus alumnos asignados
    if (query.actorRoles?.includes('COACH') && !query.actorRoles.includes('GYM_ADMIN')) {
      const assignedMemberships = await this.membershipRepository.findByGymIdAndCoachId(query.gymId, query.actorUserId!);
      const assignedUserIds = new Set(assignedMemberships.map(m => m.userId));
      attendances = attendances.filter(a => assignedUserIds.has(a.userId));
    }

    if (query.from) {
      attendances = attendances.filter(a => a.attendanceDate >= query.from!);
    }

    if (query.to) {
      attendances = attendances.filter(a => a.attendanceDate <= query.to!);
    }

    if (query.clientId) {
      attendances = attendances.filter(a => a.userId === query.clientId);
    }

    return attendances;
  }
}
