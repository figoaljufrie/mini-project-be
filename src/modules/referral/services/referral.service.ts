import { CouponService } from "../../coupon/services/coupon.service";
import { ReferralRepository } from "../repository/referral.repository";
import { PointService } from "../../points/services/point.service";

export class ReferralService {
  private referralRepository = new ReferralRepository();
  private couponService = new CouponService();
  private pointService = new PointService();

  public async useReferralCode(referredUserId: number, referralCode: string) {
    //cari orang yang punya kode referral:
    const referrer = await this.referralRepository.findUserByReferralCode(
      referralCode
    );
    if (!referrer) throw new Error("Cannot find Referral Code.");

    //link referral:
    await this.referralRepository.linkReferral(referredUserId, referrer.id);

    //kasih point ke referrer pakai PointService:
    const points = 10000;
    await this.pointService.addReferralPoints(referrer.id, points);

    //bikinin coupon buat yang pakai referral:
    const couponCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const discountIdr = 15000;

    //bikin coupon via CouponService:
    const coupon = await this.couponService.createReferralCoupon(
      referredUserId,
      discountIdr,
      couponCode
    );

    const totalPoints = await this.pointService.getAvailablePoints(referrer.id);

    return {
      message: "Referral Applied Successfully",
      referrer: {
        id: referrer.id,
        points: totalPoints,
      },
      coupon,
    };
  }
}
