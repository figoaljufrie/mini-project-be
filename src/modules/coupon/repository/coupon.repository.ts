import { CouponStatus } from "../../../generated/prisma";
import { prisma } from "../../../utils/prisma";
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

  public async findById(id: number) {
    return prisma.coupon.findUnique({ where: { id } });
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

  // get all coupons for specific organizer

  public async getAllOrganizerCoupons(organizerId: number) {
    return prisma.coupon.findMany({
      where: { organizerId },
      include: {
        _count: {
          select: { transactions: true }, // ⭐ count how many transactions used this coupon
        },
      },
    });
  }

  // get all coupons for specific customer
  public async getUserCoupons(userId: number) {
    return prisma.coupon.findMany({
      where: { userId },
    });
  }

  public async updateCouponQuantity(couponId: number, newQuantity: number) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: { quantity: newQuantity },
    });
  }

  public async updateCouponStatus(couponId: number, status: CouponStatus) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: { status: status as CouponStatus },
    });
  }

  public async updateCouponUsage(couponId: number) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new Error("Coupon not found");

    if (coupon.quantity === null) throw new Error("Coupon has no quota");

    const newUsed = (coupon.used ?? 0) + 1;

    let statusUpdate: CouponStatus | undefined = undefined;
    if (newUsed >= coupon.quantity) {
      statusUpdate = CouponStatus.USED;
    }

    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        used: newUsed,
        ...(statusUpdate && { status: statusUpdate }),
      },
    });
  }

  public async rollbackCouponUsage(couponId: number) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) throw new Error("Coupon not found");

    if (coupon.used === null || coupon.used === 0) {
      throw new Error("Coupon usage cannot be rolled back");
    }

    const newUsed = coupon.used - 1;
    const newStatus =
      newUsed < (coupon.quantity ?? Infinity)
        ? CouponStatus.AVAILABLE
        : coupon.status;

    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        used: newUsed,
        status: newStatus,
      },
    });
  }
}
