import { ReferralRepository } from "../repository/referral.repository";
import { CouponService } from "../../coupon/services/coupon.service";

export class ReferralService {
  private referralRepository = new ReferralRepository();
  private couponService = new CouponService();

  public async useReferralCode(referredUserId: number, referralCode: string) {
    // 1️⃣ Log function call
    console.log("useReferralCode called with:", {
      referredUserId,
      referralCode,
    });

    // 2️⃣ Find the referrer
    const referrer = await this.referralRepository.findUserByReferralCode(
      referralCode
    );
    console.log("Referrer found:", referrer);

    if (!referrer) throw new Error("Cannot find Referral Code.");

    // 3️⃣ Link referred user
    const linkedUser = await this.referralRepository.linkReferral(
      referredUserId,
      referrer.id
    );
    console.log(
      `Linked referredUserId ${referredUserId} to referrerId ${referrer.id}`,
      linkedUser
    );

    // 4️⃣ Add points to referrer
    const points = 10000;
    console.log(`Adding ${points} points to referrer ${referrer.id}`);
    const updatedReferrer = await this.referralRepository.addPointsReferrer(
      referrer.id,
      points
    );
    console.log("Updated referrer after points increment:", updatedReferrer);

    // 5️⃣ Create coupon for referred user
    const couponCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const couponExpireAt = new Date();
    couponExpireAt.setMonth(couponExpireAt.getMonth() + 3);
    const discountIdr = 15000;

    console.log(
      `Creating referral coupon for user ${referredUserId} with code ${couponCode}`
    );
    const coupon = await this.referralRepository.createReferralCoupon(
      referredUserId,
      couponCode,
      discountIdr,
      couponExpireAt
    );
    console.log("Referral coupon created:", coupon);

    // 6️⃣ Log before returning
    console.log("Referral flow completed:", {
      referrer: updatedReferrer,
      coupon,
    });

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
