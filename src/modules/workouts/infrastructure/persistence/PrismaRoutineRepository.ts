import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import type { RoutineRepository } from '../../domain/repositories/IRoutineRepository.js';
import { Routine } from '../../domain/entities/Routine.js';
import { RoutineMapper } from './RoutineMapper.js';

export class PrismaRoutineRepository implements RoutineRepository {
  constructor(private prisma: PrismaClient) {}

  async save(routine: Routine): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Borrado preventivo: Si la rutina ya existe, la limpiamos para evitar duplicados en actualizaciones
      await tx.routine.deleteMany({
        where: { id: routine.id }
      });

      // 2. Inserción en Cascada de la nueva estructura
      await tx.routine.create({
        data: {
          id: routine.id,
          client_id: routine.clientId,
          coach_id: routine.coachId,
          title: routine.title,
          description: routine.description,
          created_at: routine.createdAt,
          end_date: routine.endDate,
          days: {
            create: routine.days.map(day => ({
              id: day.id,
              name: day.name,
              order: day.order,
              exercises: {
                create: day.exercises.map(ex => ({
                  id: ex.id,
                  exercise_id: ex.exerciseId,
                  series: ex.series,
                  repetitions: ex.repetitions,
                  rest_time: ex.restTime,
                  order: ex.order
                }))
              }
            }))
          }
        }
      });
    });
  }

  async findById(id: string): Promise<Routine | null> {
    const raw = await this.prisma.routine.findUnique({
      where: { id },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    return raw ? RoutineMapper.toDomain(raw) : null;
  }

  async findByClientId(clientId: string): Promise<Routine[]> {
    const raws = await this.prisma.routine.findMany({
      where: { client_id: clientId },
      include: {
        days: {
          orderBy: { order: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return raws.map(RoutineMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.routine.delete({
      where: { id }
    });
  }
}