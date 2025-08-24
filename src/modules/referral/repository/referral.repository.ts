import { prisma } from "../../../utils/prisma";

export class ReferralRepository {
  //cari user lewat kode referral yg digenerate pas register:
  public async findUserByReferralCode(code: string) {
    return prisma.user.findUnique({
      where: { referralCode: code },
    });
  }

  //link orang yang pake kode referal sama orang yang kasih kode referal:
  public async linkReferral(referredUserId: number, referrerId: number) {
    return prisma.user.update({
      where: { id: referredUserId },
      data: { referredById: referrerId },
    });
  }

  //tambahin point ke orang yang kasih kode refferal:
  public async addPointsReferrer(referrerId: number, points: number) {
    return prisma.user.update({
      where: { id: referrerId },
      data: { points: { increment: points } },
    });
  }

  //bikin referral-kupon:
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