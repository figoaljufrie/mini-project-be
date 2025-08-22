export type CouponType = "REFERRAL" | "ORGANIZER";
export type CouponStatus = "AVAILABLE" | "USED" | "EXPIRED";

export interface CreateCouponDto {
  code: string;
  discountIdr: number;
  type: CouponType;
  quantity?: number;   // only for organizer coupons
  expiresAt?: Date;
}
