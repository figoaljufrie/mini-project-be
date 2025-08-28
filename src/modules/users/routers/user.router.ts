import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { $Enums } from "../../../generated/prisma";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { RBACMiddleware } from "../../../middleware/rbac.middleware";
import { validateResetPassword } from "../validators/forgot-reset.validator";
import { JwtMiddleware } from "../../../middleware/jwt.middleware";

export class UserRouter {
  private router = Router();
  private userController = new UserController();
  private authMiddleware = new AuthMiddleware();
  private rbacMiddleware = new RBACMiddleware();
  private jwtMiddleware = new JwtMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Auth routes
    //regist aman
    this.router.post("/auth/register", this.userController.create);

    this.router.post(
      "/organizer/register",
      this.userController.createOrganizer
    );

    //login aman
    this.router.post("/auth/login", this.userController.login);

    // User routes
    //get all user aman
    this.router.get(
      "/users",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.userController.getAll
    );

    this.router.get(
      "/users/:id",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.userController.findById
    );

    //get by username aman
    this.router.get(
      "/users/:username",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.userController.getByUsername
    );

    //update user aman
    this.router.patch("/users/:id", this.userController.updateUser); // update user

    //hard-delete
    this.router.delete("/users/:id", this.userController.hardDelete); // delete user

    // Optional: validate token route
    this.router.get("/auth/validate-token", this.userController.validateToken);

    this.router.post("/forgot-password", this.userController.forgotPassword);

    this.router.patch(
      "/reset-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateResetPassword,
      this.userController.resetPassword
    );
  }

  public getRouter() {
    return this.router;
  }
}
