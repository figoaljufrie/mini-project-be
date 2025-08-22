import { prisma } from "../../../utils/prisma";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";
import { CreateCouponDto } from "../dto/coupon.dto";

export class CouponRepository {
  //bikin kupo baru untuk organizer atau referral.

  public async createCoupon(
    data: CreateCouponDto,
    organizerId?: number,
    userId?: number
  ) {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discountIdr: data.discountIdr,
        type: data.type,
        quantity: data.quantity ?? null, //buat organizer
        expiresAt: data.expiresAt ?? null, //buat waktu expired.
        organizerId: organizerId ?? null, //spesifik buat organizer
        userId: userId ?? null, //buat referral
      },
    });

    return coupon;
  }

  public async findCouponByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
      },
    });
    return coupon;
  }

  //redeem coupon (logics kapan di pake, sama logics kalo udah di pake)
  public async redeemCode(dto: RedeemCouponDto) {
    const { code } = dto
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
      },
    });

    if (!coupon) {
      throw new Error("Coupon Not Found");
    }

    if (coupon.status !== "AVAILABLE") {
      throw new Error(`Coupon is already ${coupon.status}`);
    }

    //cek quantity buat kupon organizer
    if (coupon.type === "ORGANIZER" && coupon.quantity !== null) {
      if (coupon.quantity <= 0) {
        throw new Error("Coupon Is Not Available");
      }
      //kurangin qty coupon - 1
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          quantity: coupon.quantity - 1,
          status: "USED",
          usedAt: new Date(),
        },
      });
    } else {
      // kalo referral di pake, used.
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          status: "USED",
          usedAt: new Date(),
        },
      });
    }

    return { message: "Coupon Redeemed Successfully!" };
  }

  public async getAll() {
    const coupons = await prisma.coupon.findMany();
    return coupons;
  }
}
