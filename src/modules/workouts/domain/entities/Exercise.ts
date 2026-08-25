import { DomainError } from '../../../../shared/domain/errors/DomainError.js';

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

  // Factoría para crear nuevas instancias validadas
  public static create(props: ExerciseProps): Exercise {
    return new Exercise(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim() === '') {
      throw new DomainError('El nombre del ejercicio no puede estar vacío.');
    }
    if (!this.props.muscleGroup || this.props.muscleGroup.trim() === '') {
      throw new DomainError('El grupo muscular es obligatorio.');
    }
  }

  // Getters para acceder a las propiedades de forma segura
  get id(): string { 
    return this.props.id; 
  }
  
  get name(): string { 
    return this.props.name; 
  }
  
  get muscleGroup(): string { 
    return this.props.muscleGroup; 
  }
  
  get mediaUrl(): string | null | undefined { 
    return this.props.mediaUrl; 
  }
}