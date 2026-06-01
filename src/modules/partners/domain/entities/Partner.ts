import { Coupon } from './Coupon.js';

export interface PartnerProps {
  id: string;
  name: string;
  category: string;
  logoUrl?: string | null;
  isActive: boolean;
  coupons?: Coupon[];
}

export class Partner {
  constructor(private readonly props: PartnerProps) {}

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get category(): string { return this.props.category; }
  get logoUrl(): string | null | undefined { return this.props.logoUrl; }
  get isActive(): boolean { return this.props.isActive; }
  get coupons(): Coupon[] { return this.props.coupons || []; }
}