import type { IMembershipRepository } from '../../domain/repositories/IMembershipRepository.js';
import { Membership } from '../../domain/entities/Membership.js';
import { MembershipMapper } from './MembershipMapper.js';
import { prisma } from '../../../../index.js';

export class PrismaMembershipRepository implements IMembershipRepository {
  // Objeto de configuración para incluir todas las relaciones obligatorias que pide el Mapper
  private readonly includeRelations = {
    user: true,
    gym: true,
    coach: true,
  };

  async create(data: {
    user_id: string;
    gym_id: string;
    coach_id?: string | null;
    status: string;
  }): Promise<Membership> {
    const raw = await prisma.membership.create({
      data: {
        user_id: data.user_id,
        gym_id: data.gym_id,
        coach_id: data.coach_id ?? null,
        status: data.status,
      },
      include: this.includeRelations, // Clave: Traemos relaciones en la creación
    });

    return MembershipMapper.toDomain(raw);
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const raws = await prisma.membership.findMany({
      where: { user_id: userId },
      include: this.includeRelations, // Clave: Traemos relaciones en el listado
    });

    return raws.map(MembershipMapper.toDomain);
  }

  async findById(id: string): Promise<Membership | null> {
    const raw = await prisma.membership.findUnique({
      where: { id },
      include: this.includeRelations, // Clave: Traemos relaciones en la búsqueda por ID
    });

    if (!raw) return null;

    return MembershipMapper.toDomain(raw);
  }

  // Cumplimos con el contrato: Método para guardar/persistir cambios de una entidad
  async save(membership: Membership): Promise<void> {
    const persistenceData = MembershipMapper.toPersistence(membership);
    await prisma.membership.upsert({
      where: { id: membership.id },
      update: persistenceData,
      create: persistenceData,
    });
  }

  // Cumplimos con el contrato: Método específico para actualizar datos (devuelve void)
  async update(membership: Membership): Promise<void> {
    const persistenceData = MembershipMapper.toPersistence(membership);
    
    await prisma.membership.update({
      where: { id: membership.id },
      data: persistenceData,
    });
  }
}