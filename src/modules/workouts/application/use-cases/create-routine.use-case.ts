import { Routine } from '../../domain/entities/Routine.js';
import type { RoutineRepository } from '../../domain/repositories/IRoutineRepository.js';

interface ExerciseInput {
  exerciseId: string;
  series: number;
  repetitions: string;
  restTime?: number | null;
  order: number;
}

interface RoutineDayInput {
  name: string;
  order: number;
  exercises: ExerciseInput[];
}

interface CreateRoutineInput {
  client_id: string;
  coach_id: string;
  title: string;
  description?: string | null;
  end_date?: string | null;
  days: RoutineDayInput[];
}

export class CreateRoutineUseCase {
  constructor(private routineRepository: RoutineRepository) {}

  async execute(input: CreateRoutineInput): Promise<void> {
    console.log(`🏋️‍♂️ Caso de uso: Procesando rutina "${input.title}" con bloques de días.`);

    if (!input.client_id || !input.coach_id) {
      throw new Error('Faltan los identificadores del cliente o del coach.');
    }

    if (!input.days || input.days.length === 0) {
      throw new Error('La rutina debe contener al menos un día de entrenamiento.');
    }

    // Normalizamos y generamos los IDs en cascada para cumplir con el agregado del dominio
    const normalizedDays = input.days.map((day) => ({
      id: crypto.randomUUID(),
      name: day.name,
      order: day.order,
      exercises: day.exercises.map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId,
        series: ex.series,
        repetitions: ex.repetitions,
        restTime: ex.restTime ?? null,
        order: ex.order
      }))
    }));

    // Instanciamos tu Entidad de Dominio real
    const routine = Routine.create({
      id: crypto.randomUUID(),
      clientId: input.client_id,
      coachId: input.coach_id,
      title: input.title,
      description: input.description ?? null,
      createdAt: new Date(),
      endDate: input.end_date ? new Date(input.end_date) : null,
      days: normalizedDays
    });

    // Guardamos en Postgres
    await this.routineRepository.save(routine);
  }
}