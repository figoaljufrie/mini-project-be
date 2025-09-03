import { CouponRepository } from "../repository/coupon.repository";
import { CreateCouponDto } from "../dto/coupon.dto";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";
import { $Enums } from "../../../generated/prisma";

const { CouponStatus } = $Enums;

export class CouponService {
  private couponRepository: CouponRepository;

  constructor() {
    this.couponRepository = new CouponRepository();
  }

  public async createOrganizerCoupon(data: CreateCouponDto, organizerId: number) {
    if (!organizerId) {
      throw new Error("Organizer ID is required to create an organizer coupon.");
    }
    return this.couponRepository.createOrganizerCoupon(data, organizerId);
  }

  public async findById(id: number) {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) throw new Error("Coupon not found");
    return coupon;
  }

  public async createReferralCoupon(userId: number, discountIdr: number, code: string) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    return this.couponRepository.createReferralCoupon(
      { code, discountIdr, type: "REFERRAL", expiresAt },
      userId
    );
  }

  public async redeemCoupon(dto: RedeemCouponDto) {
    const coupon = await this.couponRepository.findCouponByCode(dto.code);
    if (!coupon) throw new Error("Coupon not found");

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("Coupon has expired.");
    }

    if (coupon.type === "REFERRAL" && coupon.status === CouponStatus.USED) {
      throw new Error("Coupon has been used.");
    }

    if (coupon.type === "ORGANIZER") {
      if (!coupon.quantity || coupon.quantity <= 0) {
        throw new Error("Coupon is no longer available.");
      }

      await this.couponRepository.updateCouponQuantity(coupon.id, coupon.quantity - 1);

      if (coupon.quantity - 1 === 0) {
        await this.couponRepository.updateCouponStatus(coupon.id, CouponStatus.USED);
      }
    }

    return this.couponRepository.redeemCode(dto.code, dto.userId);
  }

  public async getOrganizerCoupons(organizerId: number) {
    const coupons = await this.couponRepository.getAllOrganizerCoupons(organizerId);
    return coupons.map((c) => ({ ...c, usedCount: c._count.transactions }));
  }

  public async getUserCoupons(userId: number) {
    return this.couponRepository.getUserCoupons(userId);
  }

  public async useCoupon(couponId: number) {
    const coupon = await this.findById(couponId);

    if (coupon.type === "ORGANIZER") {
      if (coupon.quantity === null) throw new Error("Organizer coupon invalid");
      if ((coupon.used ?? 0) >= coupon.quantity) {
        throw new Error("Organizer coupon exhausted");
      }
      return this.couponRepository.updateCouponUsage(couponId);
    }

    if (coupon.type === "REFERRAL") {
      if (coupon.status === CouponStatus.USED) {
        throw new Error("Referral coupon already used");
      }
      return this.couponRepository.updateCouponStatus(couponId, CouponStatus.USED);
    }

    throw new Error("Invalid coupon type");
  }

  public async rollbackCouponUsage(couponId: number) {
  return this.couponRepository.rollbackCouponUsage(couponId);
}
}