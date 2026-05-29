import type { RoutineRepository, RoutineWithExercises } from '../../domain/repositories/IRoutineRepository.js';
import type { Routine } from '../../../../generated/prisma/client/client.js';
// Usamos el prisma global que ya tiene el adaptador configurado en el index
import { prisma } from '../../../../index.js';

export class PrismaRoutineRepository implements RoutineRepository {
  async create(data: {
    client_id: string;
    coach_id: string;
    exercises: { exercise_id: string }[];
  }): Promise<Routine> {
    // Usamos create de Prisma con "createMany" anidado para la tabla intermedia
    return prisma.routine.create({
      data: {
        client_id: data.client_id,
        coach_id: data.coach_id,
        routineExercises: {
          create: data.exercises.map((ex) => ({
            exercise_id: ex.exercise_id,
          })),
        },
      },
      // CAMBIO CLAVE: Obligamos a Prisma a que nos devuelva los IDs que genera en la intermedia
      include: {
        routineExercises: true
      }
    }) as unknown as Routine; 
    // Usamos el cast temporal para que no te chillen los tipos existentes si la interfaz pide solo Routine
  }

  async findByClientId(client_id: string): Promise<RoutineWithExercises[]> {
    // Traemos las rutinas del alumno incluyendo los datos de los ejercicios vinculados
    const routines = await prisma.routine.findMany({
      where: { client_id },
      include: {
        routineExercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return routines as RoutineWithExercises[];
  }
}