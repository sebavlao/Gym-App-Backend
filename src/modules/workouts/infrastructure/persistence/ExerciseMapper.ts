import { Exercise } from '../../domain/entities/Exercise.js';
import type { Exercise as PrismaExercise } from '../../../../generated/prisma/client/client.js';

export class ExerciseMapper {
  // Convierte de Prisma (base de datos) a tu Dominio (App)
  static toDomain(raw: PrismaExercise): Exercise {
    // Usamos el método estático create, no el constructor
    return Exercise.create({
      id: raw.id,
      name: raw.name,
      muscleGroup: raw.muscle_group,
      mediaUrl: raw.media_url
    });
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