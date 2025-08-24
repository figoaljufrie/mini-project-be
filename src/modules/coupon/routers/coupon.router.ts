import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { RBACMiddleware } from "../../../middleware/rbac.middleware";
import { $Enums } from "../../../generated/prisma";

export class CouponRouter {
  private router = Router();
  private couponController = new CouponController();
  private authMiddleware = new AuthMiddleware();
  private rbacMiddleware = new RBACMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //bikin coupon, pake authenticate & rbac buat organizer only:
    this.router.post(
      "/coupon/create-coupon",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.createCoupon
    );
    //buat redeem kupon:
    this.router.post(
      "/coupon/redeem-coupon",
      this.couponController.redeemCoupon
    );

    //ambil semua data coupon, pake authenticate & rbac buat organizer only:
    this.router.get(
      "/coupon",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.getAllCoupon
    );
  }

  public getRouter() {
    return this.router;
  }
}
