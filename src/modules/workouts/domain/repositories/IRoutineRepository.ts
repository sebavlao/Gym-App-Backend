import type { Routine, Routine_Exercise } from '../../../../generated/prisma/client/client.js';

// Definimos un tipo compuesto para cuando queramos recuperar la rutina con sus ejercicios adentro
export type RoutineWithExercises = Routine & {
  routineExercises: (Routine_Exercise & {
    exercise: {
      name: string;
      muscle_group: string;
      media_url: string | null;
    };
  })[];
};

export interface RoutineRepository {
  create(data: {
    client_id: string;
    coach_id: string;
    // 🛠️ FIX: Agregamos los campos obligatorios de la dosificación al contrato
    exercises: { 
      exercise_id: string;
      series: number;
      repetitions: string;
      rest_time?: number | null;
      order: number;
    }[];
  }): Promise<Routine>;

  findByClientId(client_id: string): Promise<RoutineWithExercises[]>;
}