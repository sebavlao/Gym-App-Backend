export interface CouponProps {
  id: string;
  partnerId: string;
  code: string;
  description: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
}

export class Coupon {
  constructor(private readonly props: CouponProps) {}

  get id(): string { return this.props.id; }
  get partnerId(): string { return this.props.partnerId; }
  get code(): string { return this.props.code; }
  get description(): string { return this.props.description; }
  get discountPercentage(): number { return this.props.discountPercentage; }
  get expirationDate(): Date { return this.props.expirationDate; }
  get isActive(): boolean { return this.props.isActive; }

  public isValid(): boolean {
    return this.props.isActive && this.props.expirationDate > new Date();
  }
}