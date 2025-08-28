import { CouponRepository } from "../repository/coupon.repository";
import { CreateCouponDto } from "../dto/coupon.dto";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";

export class CouponService {
  private couponRepository: CouponRepository;

  constructor() {
    this.couponRepository = new CouponRepository();
  }

  //organizer kalo mau bikin kcoupon:
  public async createOrganizerCoupon(
    data: CreateCouponDto,
    organizerId: number
  ) {
    if (!organizerId) {
      throw new Error(
        "ORganizer ID is required to create an organizer coupon."
      );
    }
    return this.couponRepository.createOrganizerCoupon(data, organizerId);
  }

  //bikin referal coupon buat user baru:
  public async createReferralCoupon(
    userId: number,
    discountIdr: number,
    code: string
  ) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const coupon = await this.couponRepository.createReferralCoupon(
      {
        code,
        discountIdr,
        type: "REFERRAL",
        expiresAt,
      },
      userId
    );

    return coupon;
  }

  //user redeem coupon:
  public async redeemCoupon(dto: RedeemCouponDto) {
    const coupon = await this.couponRepository.findCouponByCode(dto.code);

    //kalo coupon gak ada:
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    //cek kapan expirednya:
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("Coupon has Expired.");
    }

    // cek kalo referal coupon udah dipakai:
    if (coupon.type === "REFERRAL" && coupon.status === "USED") {
      throw new Error("Coupon has been used.");
    }
    return await this.couponRepository.redeemCode(dto.code, dto.userId);
  }

  // Get all coupons created by an organizer
  public async getOrganizerCoupons(organizerId: number) {
    return this.couponRepository.getAllOrganizerCoupons(organizerId);
  }

  // Get all coupons that belong to a customer
  public async getUserCoupons(userId: number) {
    return this.couponRepository.getUserCoupons(userId);
  }
}
