import dotenv from "dotenv";
dotenv.config();

import express, { Application } from 'express'
import cors from 'cors'
import { UserRouter } from './modules/users/routers/user.router'
import { CouponRouter } from './modules/coupon/routers/coupon.router'
// import { ReferralRouter } from './modules/referral/routers/referral.router'
import { DashboardRouter } from "./modules/dashboard/router/dashboard.router";
import { EventRouter } from "./modules/events/routers/event.router";
import { TransactionRouter } from "./modules/transactions/routers/transaction.router";
import { ReviewRouter } from "./modules/reviews/routers/review.router";

export class App {
  private app: Application
  private port: number

  constructor(port: number = 8000) {
    this.app = express()
    this.port = port
    this.app.use(cors())
    this.app.use(express.json())
    this.initializeRoutes()
  }

  /**
   * Inisialisasi semua routes untuk aplikasi
   * Setiap router akan di-mount di bawah prefix '/api'
   * 
   * Pattern yang digunakan:
   * - Class-based routers: new Router().getRouter() (UserRouter, CouponRouter, DashboardRouter)
   * - Function-based routers: Router (EventRouter, TransactionRouter, ReviewRouter)
   */
  public initializeRoutes() {
    // User management routes (login, register, profile, dll)
    // Pattern: Class-based router dengan method getRouter()
    this.app.use('/api', new UserRouter().getRouter())
    
    // Coupon management routes (redeem, create, dll)
    // Pattern: Class-based router dengan method getRouter()
    this.app.use("/api", new CouponRouter().getRouter())
    
    // Dashboard routes (statistics, analytics, dll)
    // Pattern: Class-based router dengan method getRouter()
    this.app.use("/api", new DashboardRouter().getRouter())
    
    // Event management routes (create, view, search events)
    // Pattern: Function-based router (export const EventRouter)
    this.app.use("/api/events", EventRouter)
    
    // Transaction management routes (create, view, update transactions)
    // Pattern: Function-based router (export const TransactionRouter)
    this.app.use("/api/transactions", TransactionRouter)
    
    // Review management routes (create, view, update reviews)
    // Pattern: Function-based router (export const ReviewRouter)
    this.app.use("/api/reviews", ReviewRouter)
    
    // Referral routes (temporarily disabled)
    // this.app.use("/api", new ReferralRouter().getRouter())
  }

  /**
   * Start server dan listen pada port yang ditentukan
   */
  public listen() {
    this.app.listen(this.port,() => {
      console.log(`This Server is running on http://localhost:${this.port}`)
      //console.log(`🚀 Event Ticketing Backend Ready!`)
      //console.log(`📊 Available API Endpoints:`)
      //console.log(`   - Users: http://localhost:${this.port}/api/auth/*`)
      //console.log(`   - Events: http://localhost:${this.port}/api/events/*`)
      //console.log(`   - Transactions: http://localhost:${this.port}/api/transactions/*`)
      //console.log(`   - Reviews: http://localhost:${this.port}/api/reviews/*`)
      //console.log(`   - Coupons: http://localhost:${this.port}/api/coupons/*`)
      //console.log(`   - Dashboard: http://localhost:${this.port}/api/dashboard/*`)
    })
  }
}

const app = new App()
app.listen()
