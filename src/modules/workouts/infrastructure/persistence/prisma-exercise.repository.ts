import 'dotenv/config';
import type { ExerciseRepository } from '../../domain/repositories/IExerciseRepository.js';
import { Exercise } from '../../domain/entities/Exercise.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ExerciseMapper } from './ExerciseMapper.js';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class PrismaExerciseRepository implements ExerciseRepository {
  async create(exercise: Exercise): Promise<Exercise> {
    // Aquí recibimos la entidad de dominio y la pasamos a Prisma
    const raw = await prisma.exercise.create({
      data: {
        id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscleGroup, // Mapeo: dominio -> base de datos
        media_url: exercise.mediaUrl ?? null,
      },
    });
    
    // Retornamos la entidad mapeada
    return ExerciseMapper.toDomain(raw);
  }

  async findAll(): Promise<Exercise[]> {
    const raws = await prisma.exercise.findMany();
    return raws.map(ExerciseMapper.toDomain);
  }

  async findById(id: string): Promise<Exercise | null> {
    const raw = await prisma.exercise.findUnique({
      where: { id },
    });
    return raw ? ExerciseMapper.toDomain(raw) : null;
  }
}