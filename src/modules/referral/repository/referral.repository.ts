import { prisma } from "../../../utils/prisma";

export class ReferralRepository {
  // Find user by referral code
  public async findUserByReferralCode(code: string) {
    return prisma.user.findUnique({
      where: { referralCode: code },
    });
  }

  // Link referred user to referrer
  public async linkReferral(referredUserId: number, referrerId: number) {
    return prisma.user.update({
      where: { id: referredUserId },
      data: { referredById: referrerId },
    });
  }

  // Add points to referrer and return updated user
  public async addPointsReferrer(referrerId: number, points: number) {
    return prisma.user.update({
      where: { id: referrerId },
      data: { points: { increment: points } },
    });
  }

  // Create referral coupon
  public async createReferralCoupon(userId: number, code: string, discountIdr: number, expiresAt: Date) {
    return prisma.coupon.create({
      data: {
        code,
        discountIdr,
        type: "REFERRAL",
        userId,
        expiresAt,
      },
    });
  }
}