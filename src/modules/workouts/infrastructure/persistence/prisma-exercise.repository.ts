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
  async create(exercise: Exercise, gymId?: string): Promise<Exercise> {
    const raw = await prisma.exercise.create({
      data: {
        id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscleGroup,
        media_url: exercise.mediaUrl ?? null,
        gym_id: gymId ?? null,
        is_custom: gymId ? true : false,
      },
    });
    
    return ExerciseMapper.toDomain(raw);
  }

  async findAll(): Promise<Exercise[]> {
    const raws = await prisma.exercise.findMany();
    return raws.map(ExerciseMapper.toDomain);
  }

  async findAllByGym(gymId: string): Promise<Exercise[]> {
    const raws = await prisma.exercise.findMany({
      where: {
        OR: [
          { gym_id: null },
          { gym_id: gymId },
        ],
      },
    });
    return raws.map(ExerciseMapper.toDomain);
  }

  async findById(id: string): Promise<Exercise | null> {
    const raw = await prisma.exercise.findUnique({
      where: { id },
    });
    return raw ? ExerciseMapper.toDomain(raw) : null;
  }
}
