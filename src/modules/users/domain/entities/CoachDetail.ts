interface CoachDetailProps {
  id: string;
  userId: string;
  bloodType?: string | null;
  pathologies?: string | null;
  allergies?: string | null;
  observations?: string | null;
  emergencyContact?: string | null;
}

export class CoachDetail {
  private constructor(private readonly props: CoachDetailProps) {}

  public static create(props: CoachDetailProps): CoachDetail {
    return new CoachDetail(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get bloodType(): string | null | undefined { return this.props.bloodType; }
  get pathologies(): string | null | undefined { return this.props.pathologies; }
  get allergies(): string | null | undefined { return this.props.allergies; }
  get observations(): string | null | undefined { return this.props.observations; }
  get emergencyContact(): string | null | undefined { return this.props.emergencyContact; }
}
