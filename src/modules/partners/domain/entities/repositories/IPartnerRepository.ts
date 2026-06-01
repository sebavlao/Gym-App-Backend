import { Partner } from '../Partner.js';
import { Coupon } from '../../entities/Coupon.js';

export interface IPartnerRepository {
  savePartner(partner: Partner): Promise<void>;
  saveCoupon(coupon: Coupon): Promise<void>;
  findPartnerById(id: string): Promise<Partner | null>;
  findCouponByCode(code: string): Promise<Coupon | null>;
  findAllActivePartners(): Promise<Partner[]>;
}