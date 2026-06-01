import { Routine } from '../../domain/entities/Routine.js';

export class RoutineMapper {
  static toDomain(raw: any): Routine {
    return Routine.create({
      id: raw.id,
      clientId: raw.client_id,
      coachId: raw.coach_id,
      title: raw.title,
      description: raw.description,
      createdAt: raw.created_at,
      endDate: raw.end_date,
      days: raw.days ? raw.days.map((day: any) => ({
        id: day.id,
        name: day.name,
        order: day.order,
        exercises: day.exercises ? day.exercises.map((ex: any) => ({
          id: ex.id,
          exerciseId: ex.exercise_id,
          series: ex.series,
          repetitions: ex.repetitions,
          restTime: ex.rest_time,
          order: ex.order
        })) : []
      })) : []
    });
  }
}