export interface RoutineProps {
  id: string;
  clientId: string;
  coachId: string;
}

export class Routine {
  private constructor(private readonly props: RoutineProps) {}

  public static create(props: RoutineProps): Routine {
    return new Routine(props);
  }

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get coachId(): string { return this.props.coachId; }
}