import 'dotenv/config';
import type { ExerciseRepository } from '../../domain/repositories/IExerciseRepository.js'; // type-only import
import { Exercise } from '../../domain/entities/Exercise.js';
import { PrismaClient } from '../../../../generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ExerciseMapper } from './ExerciseMapper.js';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class PrismaExerciseRepository implements ExerciseRepository {
  async create(data: {
    name: string;
    muscle_group: string;
    media_url?: string | null;
  }): Promise<Exercise> {
    const raw = await prisma.exercise.create({
      data: {
        name: data.name,
        muscle_group: data.muscle_group,
        media_url: data.media_url ?? null,
      },
    });
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