import { AttendanceSource } from '../../../../generated/prisma/client/client';

export interface AttendanceProps {
  id: string;
  membershipId: string;
  userId: string;
  gymId: string;
  attendanceDate: Date;
  checkedInAt: Date;
  recordedByUserId?: string | null;
  source: AttendanceSource;
  createdAt?: Date;
}

export class Attendance {
  private constructor(private readonly props: AttendanceProps) {}

  public static create(props: AttendanceProps): Attendance {
    return new Attendance(props);
  }

  get id(): string { return this.props.id; }
  get membershipId(): string { return this.props.membershipId; }
  get userId(): string { return this.props.userId; }
  get gymId(): string { return this.props.gymId; }
  get attendanceDate(): Date { return this.props.attendanceDate; }
  get checkedInAt(): Date { return this.props.checkedInAt; }
  get recordedByUserId(): string | null | undefined { return this.props.recordedByUserId; }
  get source(): AttendanceSource { return this.props.source; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
}
