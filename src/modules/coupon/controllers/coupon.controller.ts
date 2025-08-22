import { Request, Response } from "express";
import { handleError } from "../../../helpers/handleError";
import { handleSuccess } from "../../../helpers/handleSuccess";
import { CouponService } from "../services/coupon.service";
import { CreateCouponDto } from "../dto/coupon.dto";
import { RedeemCouponDto } from "../dto/coupon-redeem.dto";

export class CouponController {
  couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
    this.createCoupon = this.createCoupon.bind(this);
    this.redeemCoupon = this.redeemCoupon.bind(this);
    this.getAllCoupon = this.getAllCoupon.bind(this);
  }

  public async createCoupon(req: Request, res: Response) {
    try {
      const organizerId = Number((req as any).user.id); //organizer dari auth
      const data: CreateCouponDto = req.body;
      const result = await this.couponService.createCoupon(data, organizerId);
      handleSuccess(res, "Successfully create coupon!", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to generate Coupon.",
        500,
        (error as Error).message
      );
    }
  }

  public async redeemCoupon(req: Request, res: Response) {
    try {
      const data: RedeemCouponDto = req.body;
      const result = await this.couponService.redeemCoupon(data);
      handleSuccess(res, "Successfully Redeem Coupon!", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to Redeem Coupon.",
        500,
        (error as Error).message
      );
    }
  }

  public async getAllCoupon(req: Request, res: Response) {
    try {
      const result = await this.couponService.getAllCoupons();
      handleSuccess(res, "Successfully Get All Coupons!", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to Get All Coupon",
        500,
        (error as Error).message
      );
    }
  }
}
