import { CouponRepository } from "../repository/coupon.repository";
import { CreateCouponDto } from "../dto/coupon.dto";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";

export class CouponService {
  private couponRepository: CouponRepository;

  constructor() {
    this.couponRepository = new CouponRepository();
  }

  //organizer kalo mau bikin kcoupon:
  public async createCoupon(data: CreateCouponDto, organizerId: number) {
    const coupon = await this.couponRepository.createCoupon(data, organizerId);
    return coupon;
  }

  //bikin referal coupon buat user baru:
  public async generateReferralCoupon(
    userId: number,
    discountIdr: number,
    code: string
  ) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const coupon = await this.couponRepository.createCoupon(
      {
        code,
        discountIdr,
        type: "REFERRAL",
        expiresAt,
      },
      undefined, // no organizer
      userId // link ke user baru
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
    return await this.couponRepository.redeemCode(dto);
  }

  //Get all coupons (buat test atau dashboard).
  public async getAllCoupons() {
    const coupons = await this.couponRepository.getAll();
    return coupons
  }
}
