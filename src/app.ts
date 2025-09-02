import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import { UserRouter } from "./modules/users/routers/user.router";
import { CouponRouter } from "./modules/coupon/routers/coupon.router";
// import { ReferralRouter } from './modules/referral/routers/referral.router'
import { DashboardRouter } from "./modules/dashboard/router/dashboard.router";
import { EventRouter } from "./modules/events/routers/event.router";
import { TransactionRouter } from "./modules/transactions/routers/transaction.router";
import { ReviewRouter } from "./modules/reviews/routers/review.router";

export class App {
  private app: Application;
  private port: number;

  constructor(port: number = 8000) {
    this.app = express();
    this.port = port;

    // ✅ CORS setup for frontend on localhost:3000
    const corsOptions = {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true, // if sending cookies or auth headers
    };
    this.app.use(cors(corsOptions));

    // Parse JSON request bodies
    this.app.use(express.json());

    this.initializeRoutes();
  }

  /**
   * Initialize all API routes
   */
  public initializeRoutes() {
    // User routes
    this.app.use("/api", new UserRouter().getRouter());

    // Coupon routes
    this.app.use("/api", new CouponRouter().getRouter());

    // Dashboard routes
    this.app.use("/api", new DashboardRouter().getRouter());

    // Event routes
    this.app.use("/api/events", EventRouter);

    // Transaction routes
    this.app.use("/api/transactions", TransactionRouter);

    // Review routes
    this.app.use("/api/reviews", ReviewRouter);

    // Referral routes (temporarily disabled)
    // this.app.use("/api", new ReferralRouter().getRouter())
  }

  /**
   * Start server
   */
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

// Initialize and start server
const app = new App();
app.listen();
