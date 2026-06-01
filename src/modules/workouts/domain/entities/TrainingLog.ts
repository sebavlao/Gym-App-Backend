export interface TrainingLogProps {
  id: string;
  clientId: string;
  routineExerciseId: string;
  weightUsed: number;
  actualReps: number;
  caloriesBurned?: number | null;
  recordedAt?: Date;
}

export class TrainingLog {
  private constructor(private readonly props: TrainingLogProps) {
    this.validate();
  }

  public static create(props: TrainingLogProps): TrainingLog {
    return new TrainingLog({
      ...props,
      recordedAt: props.recordedAt || new Date()
    });
  }

  private validate(): void {
    if (!this.props.id) throw new Error('El ID del log de entrenamiento es obligatorio.');
    if (!this.props.clientId) throw new Error('El ID del alumno es obligatorio.');
    if (!this.props.routineExerciseId) throw new Error('El ID de la instancia de ejercicio es obligatorio.');
    if (this.props.weightUsed < 0) throw new Error('El peso utilizado no puede ser negativo.');
    if (this.props.actualReps <= 0) throw new Error('Las repeticiones reales deben ser mayores a cero.');
  }

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get routineExerciseId(): string { return this.props.routineExerciseId; }
  get weightUsed(): number { return this.props.weightUsed; }
  get actualReps(): number { return this.props.actualReps; }
  get caloriesBurned(): number | null | undefined { return this.props.caloriesBurned; }
  get recordedAt(): Date | undefined { return this.props.recordedAt; }
}