import { prisma } from "../../../utils/prisma";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";
import { CreateCouponDto } from "../dto/coupon.dto";

export class CouponRepository {
  //bikin kupon buat organizer:
  public async createOrganizerCoupon(
    data: CreateCouponDto,
    organizerId: number
  ) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        discountIdr: data.discountIdr,
        type: "ORGANIZER",
        quantity: data.quantity ?? null,
        expiresAt: data.expiresAt ?? null,
        organizerId,
        userId: null, // organizer coupons don’t belong to a user
      },
    });
  }
  //bikin kupon buat user:
  public async createReferralCoupon(data: CreateCouponDto, userId: number) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        discountIdr: data.discountIdr,
        type: "REFERRAL",
        expiresAt: data.expiresAt ?? null,
        userId,
        organizerId: null,
        quantity: null,
      },
    });
  }

  //nyari kupon dari kode:
  public async findCouponByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
      },
    });
    return coupon;
  }

  //redeem coupon (logics kapan di pake, sama logics kalo udah di pake)
  async redeemCode(code: string, userId: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });
  if (!coupon) throw new Error("Invalid coupon code");

  if (coupon.type === "ORGANIZER") {
    if (coupon.status !== "AVAILABLE") {
      throw new Error("Coupon is not available");
    }
    if (coupon.quantity && coupon.quantity > 0) {
      const updated = await prisma.coupon.update({
        where: { code },
        data: {
          quantity: coupon.quantity - 1,
          status: coupon.quantity - 1 === 0 ? "EXPIRED" : "AVAILABLE", // ✅ only expire when qty = 0
        },
      });
      return updated; // ✅ return updated coupon
    }
    throw new Error("Coupon quantity exceeded");
  }

  if (coupon.type === "REFERRAL") {
    if (coupon.userId) throw new Error("Referral coupon already used");
    const updated = await prisma.coupon.update({
      where: { code },
      data: {
        userId: Number(userId),
        status: "USED",
      },
    });
    return updated; // ✅ return updated coupon
  }
}

  //nyari kupon yang disediain organizer:
  public async getAll() {
    const coupons = await prisma.coupon.findMany();
    return coupons;
  }
}
