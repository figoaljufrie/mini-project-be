import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { $Enums } from "../../../generated/prisma";
import { AuthMiddleware } from "../../../middleware/auth.middleware";
import { RBACMiddleware } from "../../../middleware/rbac.middleware";

export class UserRouter {
  private router = Router();
  private userController = new UserController();
  private authMiddleware = new AuthMiddleware();
  private rbacMiddleware = new RBACMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Auth routes
    //regist aman
    this.router.post("/auth/register", this.userController.create);
    //login aman
    this.router.post("/auth/login", this.userController.login);

    // User routes
    //get user aman
    this.router.get(
      "/users",
      this.authMiddleware.authenticate,
      this.rbacMiddleware.checkRole([$Enums.Role.ORGANIZER]),
      this.userController.getAll
    ); // get all users
    //get by username aman
    this.router.get("/users/:username", this.userController.getByUsername); // get user by username

    //update user aman
    this.router.patch("/users/:id", this.userController.updateUser); // update user

    //hard-delete
    this.router.delete("/users/:id", this.userController.hardDelete); // delete user

    // Optional: validate token route
    this.router.get("/auth/validate-token", this.userController.validateToken);
  }

  public getRouter() {
    return this.router;
  }
}
