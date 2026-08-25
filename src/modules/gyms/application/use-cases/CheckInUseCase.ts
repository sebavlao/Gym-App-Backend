import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { Attendance } from '../../domain/entities/Attendance';
import { AttendanceSource } from '../../../../generated/prisma/client/client';

export interface CheckInCommand {
  gymId: string;
  userId: string;
  recordedByUserId?: string;
  source?: AttendanceSource;
}

export class CheckInUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(command: CheckInCommand): Promise<Attendance> {
    // Verificar que el usuario tiene una membresía activa en el gimnasio
    const memberships = await this.membershipRepository.findByUserId(command.userId);
    const activeMembership = memberships.find(
      m => m.gymId === command.gymId && m.status === 'active'
    );
    
    if (!activeMembership) {
      throw new Error('El usuario no tiene una membresía activa en este gimnasio');
    }
    
    // Verificar si ya hizo check-in hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendances = await this.attendanceRepository.findByGymIdAndDate(command.gymId, today);
    const alreadyCheckedIn = todayAttendances.find(a => a.userId === command.userId);
    
    if (alreadyCheckedIn) {
      throw new Error('El usuario ya hizo check-in hoy');
    }
    
    // Crear registro de asistencia
    const attendance = Attendance.create({
      id: crypto.randomUUID(),
      membershipId: activeMembership.id,
      userId: command.userId,
      gymId: command.gymId,
      attendanceDate: today,
      checkedInAt: new Date(),
      recordedByUserId: command.recordedByUserId,
      source: command.source || AttendanceSource.MANUAL,
    });
    
    await this.attendanceRepository.save(attendance);
    
    return attendance;
  }
}
