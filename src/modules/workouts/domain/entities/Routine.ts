export interface ExerciseInstanceProps {
  id: string;
  exerciseId: string;
  series: number;
  repetitions: string;
  restTime?: number | null;
  order: number;
}

export interface RoutineDayProps {
  id: string;
  name: string;
  order: number;
  exercises: ExerciseInstanceProps[];
}

export interface RoutineProps {
  id: string;
  clientId: string;
  coachId: string;
  title: string;
  description?: string | null;
  createdAt: Date;
  endDate?: Date | null;
  days: RoutineDayProps[];
}

export class Routine {
  private constructor(private readonly props: RoutineProps) {
    this.validate();
  }

  public static create(props: RoutineProps): Routine {
    return new Routine({
      ...props,
      createdAt: props.createdAt || new Date()
    });
  }

  private validate(): void {
    if (!this.props.id) throw new Error('El ID de la rutina es obligatorio.');
    if (!this.props.clientId) throw new Error('El ID del alumno es obligatorio.');
    if (!this.props.coachId) throw new Error('El ID del profesor asignado es obligatorio.');
    if (!this.props.title || this.props.title.trim() === '') throw new Error('El título de la rutina es obligatorio.');
    if (!this.props.days || this.props.days.length === 0) {
      throw new Error('La estructura de la rutina debe incluir al menos un día de entrenamiento.');
    }
  }

  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get coachId(): string { return this.props.coachId; }
  get title(): string { return this.props.title; }
  get description(): string | null | undefined { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
  get endDate(): Date | null | undefined { return this.props.endDate; }
  get days(): RoutineDayProps[] { return this.props.days; }
}