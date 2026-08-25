import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { Attendance } from '../../domain/entities/Attendance';

export interface GetUserAttendanceQuery {
  userId: string;
  gymId: string;
}

export class GetUserAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(query: GetUserAttendanceQuery): Promise<Attendance[]> {
    // Obtener asistencia del usuario dentro del gimnasio específico
    const allAttendance = await this.attendanceRepository.findByUserId(query.userId);
    return allAttendance.filter(a => a.gymId === query.gymId);
  }
}
