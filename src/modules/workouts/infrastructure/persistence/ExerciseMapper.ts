import { Exercise } from '../../domain/entities/Exercise.js';
import type { Exercise as PrismaExercise } from '../../../../generated/prisma/client/client.js';

export class ExerciseMapper {
  // Convierte de Prisma (base de datos) a tu Dominio (App)
  static toDomain(raw: PrismaExercise): Exercise {
    return new Exercise(
      raw.id,
      raw.name,
      raw.muscle_group,
      raw.media_url
    );
  }

  // Convierte de tu Dominio (App) a Prisma (para guardar)
  static toPersistence(exercise: Exercise) {
    return {
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      media_url: exercise.mediaUrl,
    };
  }
}