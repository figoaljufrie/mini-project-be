import { ReferralRepository } from "../repository/referral.repository";
import { CouponService } from "../../coupon/services/coupon.service";

export class ReferralService {
  private referralRepository = new ReferralRepository();
  private couponService = new CouponService();

  public async useReferralCode(referredUserId: number, referralCode: string) {
    //cari orang yang punya kode referral:
    const referrer = await this.referralRepository.findUserByReferralCode(
      referralCode
    );

    if (!referrer) throw new Error("Cannot find Referral Code.");

    //hubungin user yang pake referral sama yang dipake referralnya:
    const linkedUser = await this.referralRepository.linkReferral(
      referredUserId,
      referrer.id
    );
    console.log(
      `Linked referredUserId ${referredUserId} to referrerId ${referrer.id}`,
      linkedUser
    );

    //kasih point ke orang yang referralnya dipake:
    const points = 10000;
    const updatedReferrer = await this.referralRepository.addPointsReferrer(
      referrer.id,
      points
    );

    //bikinin kupon buat orang yang pake kode referral:
    const couponCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const couponExpireAt = new Date();
    couponExpireAt.setMonth(couponExpireAt.getMonth() + 3);
    const discountIdr = 15000;

    const coupon = await this.referralRepository.createReferralCoupon(
      referredUserId,
      couponCode,
      discountIdr,
      couponExpireAt
    );

    return {
      message: "Referral Applied Successfully",
      referrer: {
        id: updatedReferrer.id,
        points: updatedReferrer.points,
      },
      coupon,
    };
  }
}
