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
    this.router.post(
      "/coupon/create-coupon",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.createCoupon
    );
    this.router.post(
      "/coupon/redeem-coupon",
      this.couponController.redeemCoupon
    );
    this.router.get("/coupon", 
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.getAllCoupon);
  }

  public getRouter() {
    return this.router;
  }
}
