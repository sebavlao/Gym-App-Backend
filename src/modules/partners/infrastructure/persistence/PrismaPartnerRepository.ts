import type { IPartnerRepository } from '../../domain/entities/repositories/IPartnerRepository.js';
import { Partner } from '../../domain/entities/Partner.js';
import { Coupon } from '../../domain/entities/Coupon.js';
import { prisma } from '../../../../shared/infrastructure/persistence/prisma.js';
import { PartnerMapper } from './PartnerMapper.js';

export class PrismaPartnerRepository implements IPartnerRepository {
  public async savePartner(partner: Partner): Promise<void> {
    // Prisma expone los modelos en minúscula/camelCase en su cliente
    await (prisma as any).partner.upsert({
      where: { id: partner.id },
      update: {
        name: partner.name,
        category: partner.category,
        logo_url: partner.logoUrl,
        is_active: partner.isActive
      },
      create: {
        id: partner.id,
        name: partner.name,
        category: partner.category,
        logo_url: partner.logoUrl,
        is_active: partner.isActive
      }
    });
  }

  public async saveCoupon(coupon: Coupon): Promise<void> {
    await (prisma as any).coupon.upsert({
      where: { id: coupon.id },
      update: {
        code: coupon.code,
        description: coupon.description,
        discount_percentage: coupon.discountPercentage,
        expiration_date: coupon.expirationDate,
        is_active: coupon.isActive
      },
      create: {
        id: coupon.id,
        partner_id: coupon.partnerId,
        code: coupon.code,
        description: coupon.description,
        discount_percentage: coupon.discountPercentage,
        expiration_date: coupon.expirationDate,
        is_active: coupon.isActive
      }
    });
  }

  public async findPartnerById(id: string): Promise<Partner | null> {
    const prismaPartner = await (prisma as any).partner.findUnique({
      where: { id },
      include: { coupons: true }
    });

    if (!prismaPartner) return null;
    return PartnerMapper.toDomain(prismaPartner);
  }

  public async findCouponByCode(code: string): Promise<Coupon | null> {
    const prismaCoupon = await (prisma as any).coupon.findUnique({
      where: { code }
    });

    if (!prismaCoupon) return null;
    return PartnerMapper.couponToDomain(prismaCoupon);
  }

  public async findAllActivePartners(): Promise<Partner[]> {
    const prismaPartners = await (prisma as any).partner.findMany({
      where: { is_active: true },
      include: { coupons: { where: { is_active: true } } }
    });

    return prismaPartners.map((p: any) => PartnerMapper.toDomain(p));
  }
}