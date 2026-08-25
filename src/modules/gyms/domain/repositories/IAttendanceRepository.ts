import { Attendance } from '../entities/Attendance';

export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByUserId(userId: string): Promise<Attendance[]>;
  findByGymId(gymId: string): Promise<Attendance[]>;
  findByGymIdAndDate(gymId: string, date: Date): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<void>;
}
