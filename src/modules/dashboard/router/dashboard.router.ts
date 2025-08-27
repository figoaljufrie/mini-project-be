import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { RBACMiddleware } from "../../../middleware/rbac.middleware";
import { $Enums } from "../../../generated/prisma";

export class DashboardRouter {
  private router = Router();
  private dashboardController = new DashboardController();
  private authMiddleware = new AuthMiddleware();
  private rbacMiddleware = new RBACMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // All dashboard routes require authentication + organizer role
    this.router.get(
      "/dashboard/transactions",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTransaction
    );

    this.router.get(
      "/dashboard/revenue",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTotalRevenue
    );

    this.router.get(
      "/dashboard/attendees",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTotalAttendees
    );

    this.router.get(
      "/dashboard/transactions/:transactionId",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTransactionById
    );

    this.router.get(
      "/dashboard/vouchers",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTotalVouchers
    );

    this.router.get(
      "/dashboard/events",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.dashboardController.getTotalEvents
    );

    // Example if you want tickets later
    // this.router.get(
    //   "/dashboard/tickets",
    //   this.authMiddleware.authenticate,
    //   this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
    //   this.dashboardController.getTotalTickets
    // );
  }

  public getRouter() {
    return this.router;
  }
}