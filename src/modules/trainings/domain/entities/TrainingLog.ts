export interface TrainingLogProps {
  id: string;
  clientId: string;
  routineExerciseId: string;
  weightUsed: number;
  actualReps: number;
  caloriesBurned?: number | null;
}

export interface TrainingLogProps {
  id: string;
  clientId: string;
  routineExerciseId: string;
  weightUsed: number;
  actualReps: number;
  caloriesBurned?: number | null;
}

export class TrainingLog {
  private constructor(private readonly props: TrainingLogProps) {}

  public static create(props: TrainingLogProps): TrainingLog {
    return new TrainingLog(props);
  }

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get routineExerciseId(): string { return this.props.routineExerciseId; }
  get weightUsed(): number { return this.props.weightUsed; }
  get actualReps(): number { return this.props.actualReps; }
  get caloriesBurned(): number | null | undefined { return this.props.caloriesBurned; }
}