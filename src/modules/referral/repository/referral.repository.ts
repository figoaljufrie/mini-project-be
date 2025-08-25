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
}