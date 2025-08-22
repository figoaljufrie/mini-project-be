import { Request, Response } from "express";
import { handleError } from "../../../helpers/handleError";
import { handleSuccess } from "../../../helpers/handleSuccess";
import { LoginDTO } from "../dto/login.dto";
import { UpdateUserDTO } from "../dto/update.dto";
import { UserDTO } from "../dto/user.dto";
import { UserService } from "../services/user.service";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();

    this.create = this.create.bind(this);
    this.login = this.login.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getByUsername = this.getByUsername.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.hardDelete = this.hardDelete.bind(this);
    this.validateToken = this.validateToken.bind(this);
  }

  public async create(req: Request, res: Response) {
  try {
    // pass the whole body including referralCode
    const result = await this.userService.create(req.body);
    handleSuccess(res, "Successfully Created a new user", result, 200);
  } catch (error) {
    handleError(res, "Failed to Create User", 500, (error as Error).message);
  }
}

  public async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginDTO = req.body;
      const result = await this.userService.login({ email, password });
      handleSuccess(res, "Successfully login!", result, 200);
    } catch (error) {
      handleError(res, "Failed to login.", 500, (error as Error).message);
    }
  }

  public async getAll(req: Request, res: Response) {
    try {
      const result = await this.userService.getAll();
      handleSuccess(res, "Successfully get all users.", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to get All Users.",
        500,
        (error as Error).message
      );
    }
  }

  public async getByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      if (!username) {
        return handleError(
          res,
          "Username param is required",
          400,
          "Missing username"
        );
      }

      const result = await this.userService.getByUsername(username);

      handleSuccess(res, "Successfully got user by username", result, 200);
    } catch (error) {
      handleError(
        res,
        "Failed to get by username",
        500,
        (error as Error).message
      );
    }
  }

  public async validateToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return handleError(res, "No token provided", 401, "Unauthorized");
      }

      const parts = authHeader.split(" ");
      if (parts.length < 2 || !parts[1]) {
        return handleError(res, "Invalid token format", 401, "Unauthorized");
      }

      const token: string = parts[1]; // now TS knows it's a string
      const result = await this.userService.validateToken(token);

      return handleSuccess(res, "Token validated successfully", result, 200);
    } catch (error) {
      return handleError(
        res,
        "Failed to validate token",
        401,
        (error as Error).message
      );
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params; // id comes from URL params
      const userId = Number(id); // ensure it's a number

      if (isNaN(userId)) {
        return handleError(res, "Invalid user id", 400, "ID must be a number");
      }

      const data: UpdateUserDTO = req.body; // body should match DTO

      const result = await this.userService.updateUser(userId, data);

      return handleSuccess(res, "User updated successfully", result, 200);
    } catch (error) {
      return handleError(
        res,
        "Failed to update user",
        500,
        (error as Error).message
      );
    }
  }

  public async hardDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = Number(id);

      if (isNaN(userId)) {
        return handleError(res, "Invalid user id", 400, "ID must be a number");
      }

      const result = await this.userService.hardDelete(userId);

      return handleSuccess(res, "User deleted successfully", result, 200);
    } catch (error) {
      return handleError(
        res,
        "Failed to delete user",
        500,
        (error as Error).message
      );
    }
  }
}
