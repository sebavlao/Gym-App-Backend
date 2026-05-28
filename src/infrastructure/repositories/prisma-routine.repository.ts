import 'dotenv/config';
import type { RoutineRepository, RoutineWithExercises } from '../../modules/trainings/domain/routine.repository.js';
import type { Routine } from '../../generated/prisma/client/client.js';
import { PrismaClient } from '../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const localPrisma = new PrismaClient({ adapter });

export class PrismaRoutineRepository implements RoutineRepository {
  async create(data: {
    client_id: string;
    coach_id: string;
    exercises: { exercise_id: string }[];
  }): Promise<Routine> {
    // Usamos create de Prisma con "createMany" anidado para la tabla intermedia
    return localPrisma.routine.create({
      data: {
        client_id: data.client_id,
        coach_id: data.coach_id,
        routineExercises: {
          create: data.exercises.map((ex) => ({
            exercise_id: ex.exercise_id,
          })),
        },
      },
    });
  }

  async findByClientId(client_id: string): Promise<RoutineWithExercises[]> {
    // Traemos las rutinas del alumno incluyendo los datos de los ejercicios vinculados
    return localPrisma.routine.findMany({
      where: { client_id },
      include: {
        routineExercises: {
          include: {
            exercise: true,
          },
        },
      },
    }) as Promise<RoutineWithExercises[]>;
  }
}