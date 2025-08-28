import { Request, Response } from "express";
import { handleError } from "../../../helpers/handleError";
import { handleSuccess } from "../../../helpers/handleSuccess";
import { CouponService } from "../services/coupon.service";
import { CreateCouponDto } from "../dto/coupon.dto";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";

export class CouponController {
  private couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
    this.createOrganizerCoupon = this.createOrganizerCoupon.bind(this);
    this.redeemCoupon = this.redeemCoupon.bind(this);
    this.getUserCoupons = this.getUserCoupons.bind(this);
    this.getOrganizerCoupons = this.getOrganizerCoupons.bind(this);
  }

  // http request buat create kupon (organizer only)
  public async createOrganizerCoupon(req: Request, res: Response) {
    try {
      const organizerId = Number((req as any).user.id); // organizer dari auth middleware
      const data: CreateCouponDto = req.body;

      const result = await this.couponService.createOrganizerCoupon(
        data,
        organizerId
      );

      handleSuccess(res, "Successfully created organizer coupon!", result, 201);
    } catch (error) {
      handleError(
        res,
        "Failed to create coupon.",
        500,
        (error as Error).message
      );
    }
  }

  // http request buat redeem kupon:
  public async redeemCoupon(req: Request, res: Response) {
    try {
      const data: RedeemCouponDto = req.body;
      const result = await this.couponService.redeemCoupon(data);

      handleSuccess(res, "Successfully redeemed coupon!", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to redeem coupon.",
        400,
        (error as Error).message
      );
    }
  }

  // Organizer coupons
  public async getOrganizerCoupons(req: Request, res: Response) {
    try {
      const organizerId = Number((req as any).user.id);
      const result = await this.couponService.getOrganizerCoupons(organizerId);
      handleSuccess(
        res,
        "Successfully retrieved organizer coupons!",
        result,
        200
      );
    } catch (error) {
      handleError(
        res,
        "Failed to get organizer coupons",
        500,
        (error as Error).message
      );
    }
  }

  // Customer coupons
  public async getUserCoupons(req: Request, res: Response) {
    try {
      const userId = Number((req as any).user.id);
      const result = await this.couponService.getUserCoupons(userId);
      handleSuccess(res, "Successfully retrieved user coupons!", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to get user coupons",
        500,
        (error as Error).message
      );
    }
  }
}
