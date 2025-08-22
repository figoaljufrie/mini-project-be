import express, { Application } from 'express'
import cors from 'cors'
import { UserRouter } from './modules/users/routers/user.router'
import { CouponRouter } from './modules/coupon/routers/coupon.router'
// import { ReferralRouter } from './modules/referral/routers/referral.router'

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

  public initializeRoutes() {
    this.app.use('/api', new UserRouter().getRouter())
    this.app.use("/api", new CouponRouter().getRouter())
    // this.app.use("/api", new ReferralRouter().getRouter())
  }

  public listen() {
    this.app.listen(this.port,() => {
      console.log(`This Server is running on http://localhost:${this.port}`)
    })
  }
}
const app = new App()
app.listen()