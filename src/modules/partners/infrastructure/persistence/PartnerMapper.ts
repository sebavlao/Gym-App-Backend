import { prisma } from '../../../../shared/infrastructure/persistence/prisma.js';
import { Partner } from '../../domain/entities/Partner.js';
import { Coupon } from '../../domain/entities/Coupon.js';

// Usamos los tipos directos inferidos de las consultas de Prisma para evitar exportaciones rotas
type PrismaPartnerWithCoupons = any; 
type PrismaCoupon = any;

export class PartnerMapper {
  public static toDomain(prismaPartner: any): Partner {
    const coupons = prismaPartner.coupons?.map((c: any) => this.couponToDomain(c)) || [];
    
    return new Partner({
      id: prismaPartner.id,
      name: prismaPartner.name,
      category: prismaPartner.category,
      logoUrl: prismaPartner.logo_url,
      isActive: prismaPartner.is_active,
      coupons
    });
  }

  public static couponToDomain(prismaCoupon: any): Coupon {
    return new Coupon({
      id: prismaCoupon.id,
      partnerId: prismaCoupon.partner_id,
      code: prismaCoupon.code,
      description: prismaCoupon.description,
      discountPercentage: prismaCoupon.discount_percentage,
      expirationDate: prismaCoupon.expiration_date,
      isActive: prismaCoupon.is_active
    });
  }
}