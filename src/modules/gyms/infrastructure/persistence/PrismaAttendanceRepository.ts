import type { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository.js';
import { Attendance } from '../../domain/entities/Attendance.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';

export class PrismaAttendanceRepository implements IAttendanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Attendance | null> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) return null;

    return Attendance.create({
      id: attendance.id,
      membershipId: attendance.membership_id,
      userId: attendance.user_id,
      gymId: attendance.gym_id,
      attendanceDate: attendance.attendance_date,
      checkedInAt: attendance.checked_in_at,
      recordedByUserId: attendance.recorded_by_user_id,
      source: attendance.source,
      createdAt: attendance.created_at,
    });
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    const attendances = await this.prisma.attendance.findMany({
      where: { user_id: userId },
      orderBy: { attendance_date: 'desc' },
    });

    return attendances.map(a => Attendance.create({
      id: a.id,
      membershipId: a.membership_id,
      userId: a.user_id,
      gymId: a.gym_id,
      attendanceDate: a.attendance_date,
      checkedInAt: a.checked_in_at,
      recordedByUserId: a.recorded_by_user_id,
      source: a.source,
      createdAt: a.created_at,
    }));
  }

  async findByGymId(gymId: string): Promise<Attendance[]> {
    const attendances = await this.prisma.attendance.findMany({
      where: { gym_id: gymId },
      orderBy: { attendance_date: 'desc' },
    });

    return attendances.map(a => Attendance.create({
      id: a.id,
      membershipId: a.membership_id,
      userId: a.user_id,
      gymId: a.gym_id,
      attendanceDate: a.attendance_date,
      checkedInAt: a.checked_in_at,
      recordedByUserId: a.recorded_by_user_id,
      source: a.source,
      createdAt: a.created_at,
    }));
  }

  async findByGymIdAndDate(gymId: string, date: Date): Promise<Attendance[]> {
    const attendances = await this.prisma.attendance.findMany({
      where: {
        gym_id: gymId,
        attendance_date: date,
      },
      orderBy: { checked_in_at: 'desc' },
    });

    return attendances.map(a => Attendance.create({
      id: a.id,
      membershipId: a.membership_id,
      userId: a.user_id,
      gymId: a.gym_id,
      attendanceDate: a.attendance_date,
      checkedInAt: a.checked_in_at,
      recordedByUserId: a.recorded_by_user_id,
      source: a.source,
      createdAt: a.created_at,
    }));
  }

  async save(attendance: Attendance): Promise<void> {
    await this.prisma.attendance.create({
      data: {
        id: attendance.id,
        membership_id: attendance.membershipId,
        user_id: attendance.userId,
        gym_id: attendance.gymId,
        attendance_date: attendance.attendanceDate,
        checked_in_at: attendance.checkedInAt,
        recorded_by_user_id: attendance.recordedByUserId,
        source: attendance.source,
      },
    });
  }
}
