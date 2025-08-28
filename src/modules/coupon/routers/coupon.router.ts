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
    // bikin kupon buat organizer:
    this.router.post(
      "/coupons/create",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.createOrganizerCoupon
    );

    // Bikin kupon buat user:
    this.router.post(
      "/coupons/redeem",
      this.authMiddleware.authenticate, // ⬅️ usually customer must be logged in
      this.rbacMiddleware.checkRole([$Enums.Role.CUSTOMER]), // restrict to customer
      this.couponController.redeemCoupon
    );

    // Organizer: see own coupons
    this.router.get(
      "/coupons/organizer",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.couponController.getOrganizerCoupons
    );

    // Customer: see their coupons
    this.router.get(
      "/coupons/me",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.CUSTOMER]),
      this.couponController.getUserCoupons
    );
  }

  public getRouter() {
    return this.router;
  }
}
