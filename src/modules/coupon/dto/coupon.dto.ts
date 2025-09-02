import { $Enums } from "../../../generated/prisma";

export type CouponType = "REFERRAL" | "ORGANIZER";

export interface CreateCouponDto {
  code: string;
  discountIdr: number;
  type: CouponType;
  quantity?: number; // only for organizer coupons
  expiresAt?: Date;
  status?: $Enums.CouponStatus;
}
