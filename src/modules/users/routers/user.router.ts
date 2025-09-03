import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { $Enums } from "../../../generated/prisma";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { RBACMiddleware } from "../../../middleware/rbac.middleware";
import { validateResetPassword } from "../../validators/forgot-reset.validator";
import { validateEmail } from "../../validators/email.validator";
import { validateName } from "../../validators/name.validator";
import { validateUsername } from "../../validators/username.validator";
import { JwtMiddleware } from "../../../middleware/jwt.middleware";
import { UploaderMiddleware } from "../../../middleware/uploader.middleware";

export class UserRouter {
  private router = Router();
  private userController = new UserController();
  private authMiddleware = new AuthMiddleware();
  private rbacMiddleware = new RBACMiddleware();
  private jwtMiddleware = new JwtMiddleware();

  private uploaderMiddleware = new UploaderMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Auth routes
    //regist aman
    this.router.post(
      "/auth/register",
      validateName,
      validateEmail,
      validateUsername,
      validateResetPassword,
      this.userController.create
    );

    this.router.post(
      "/organizer/register",
      validateName,
      validateEmail,
      validateUsername,
      validateResetPassword,
      this.userController.createOrganizer
    );

    //login aman
    this.router.post(
      "/auth/login",
      validateEmail,
      validateResetPassword,
      this.userController.login
    );

    // User routes
    //get all user aman
    this.router.get(
      "/users",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.userController.getAll
    );

    // user.router.ts
    this.router.get(
      "/auth/me",
      this.authMiddleware.authenticate,
      this.userController.getMe
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
    this.router.patch(
      "/users/:id",
      validateName,
      validateUsername,
      this.userController.updateUser
    ); // update user

    //hard-delete
    this.router.delete("/users/:id", this.userController.hardDelete); // delete user

    // Optional: validate token route
    this.router.get("/auth/validate-token", this.userController.validateToken);

    this.router.post(
      "/auth/forgot-password",
      validateEmail,
      this.userController.forgotPassword
    );

    this.router.patch(
      "/auth/reset-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateResetPassword,
      this.userController.resetPassword
    );

    // user.router.ts
    this.router.patch(
      "/auth/update-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      // validateResetPassword,
      this.authMiddleware.authenticate,
      this.userController.updatePassword
    );

    this.router.put(
      "/:id/avatar",
      this.uploaderMiddleware.upload().single("avatar"),
      this.uploaderMiddleware.fileFilter(["image/jpeg", "image/png"]),
      this.userController.updateAvatar
    );
  }

  public getRouter() {
    return this.router;
  }
}
