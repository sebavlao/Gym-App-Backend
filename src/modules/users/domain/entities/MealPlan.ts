import { DomainError } from '../../../../shared/domain/errors/DomainError.js';

interface MealItemProps {
  id: string;
  foodName: string;
  quantity: string;
  protein: number;
  carbs: number;
  fats: number;
  alternatives?: string | null;
}

interface MealProps {
  id: string;
  name: string;
  order: number;
  items: MealItemProps[];
}

interface MealPlanProps {
  id: string;
  clientId: string;
  coachId: string;
  title: string;
  description?: string | null;
  meals: MealProps[];
  createdAt: Date;
  endDate: Date;
}

export class MealPlan {
  private constructor(private readonly props: MealPlanProps) {
    this.validate();
  }

  public static create(props: MealPlanProps): MealPlan {
    return new MealPlan(props);
  }

  private validate(): void {
    if (!this.props.clientId) {
      throw new DomainError('El plan nutricional debe estar asociado a un alumno.', 'INVALID_CLIENT');
    }
    if (!this.props.coachId) {
      throw new DomainError('El plan nutricional debe tener un profesional asignado.', 'INVALID_COACH');
    }
    if (!this.props.title || this.props.title.trim() === '') {
      throw new DomainError('El título del plan alimentario no puede estar vacío.', 'INVALID_TITLE');
    }
    if (this.props.endDate <= this.props.createdAt) {
      throw new DomainError('La fecha de finalización debe ser posterior a la fecha de creación.', 'INVALID_DATE_RANGE');
    }
  }

  // Getters para exponer los datos de manera segura hacia la infraestructura
  get id(): string { return this.props.id; }
  get clientId(): string { return this.props.clientId; }
  get coachId(): string { return this.props.coachId; }
  get title(): string { return this.props.title; }
  get description(): string | null | undefined { return this.props.description; }
  get meals(): MealProps[] { return this.props.meals; }
  get createdAt(): Date { return this.props.createdAt; }
  get endDate(): Date { return this.props.endDate; }
}