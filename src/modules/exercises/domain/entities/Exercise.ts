import { DomainError } from '../../../../shared/domain/errors/DomainError';

interface ExerciseProps {
  id: string;
  name: string;
  muscleGroup: string;
  mediaUrl?: string | null;
}

export class Exercise {
  private constructor(private readonly props: ExerciseProps) {
    this.validate();
  }

  public static create(props: ExerciseProps): Exercise {
    return new Exercise(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim() === '') {
      throw new Error('El nombre del ejercicio no puede estar vacío.');
    }
    if (!this.props.muscleGroup || this.props.muscleGroup.trim() === '') {
      throw new Error('El grupo muscular es obligatorio.');
    }
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get muscleGroup(): string { return this.props.muscleGroup; }
  get mediaUrl(): string | null | undefined { return this.props.mediaUrl; }
}