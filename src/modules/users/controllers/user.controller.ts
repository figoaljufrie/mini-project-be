import { Request, Response } from "express";
import { handleError } from "../../../helpers/handleError";
import { handleSuccess } from "../../../helpers/handleSuccess";
import { LoginDTO } from "../dto/login.dto";
import { UpdateUserDTO } from "../dto/update.dto";
import { UserService } from "../services/user.service";
import { PointService } from "../../points/services/point.service";
import { CloudinaryService } from "../../cloudinary/cloudinary.service";

export class UserController {
  userService: UserService;
  cloudinaryService: CloudinaryService;
  pointService: PointService;
  constructor() {
    this.userService = new UserService();
    this.cloudinaryService = new CloudinaryService();
    this.pointService = new PointService();

    this.create = this.create.bind(this);
    this.createOrganizer = this.createOrganizer.bind(this);
    this.login = this.login.bind(this);
    this.getAll = this.getAll.bind(this);
    this.findById = this.findById.bind(this);
    this.getByUsername = this.getByUsername.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.hardDelete = this.hardDelete.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateAvatar = this.updateAvatar.bind(this);
  }

  public async create(req: Request, res: Response) {
    try {
      // pass the whole body including referralCode
      const result = await this.userService.create(req.body);
      const { password, ...safeUser } = result;
      handleSuccess(res, "Successfully Created a new user", safeUser, 200);
    } catch (error) {
      handleError(res, "Failed to Create User", 500, (error as Error).message);
    }
  }

  //create user buat role Organizer:
  public async createOrganizer(req: Request, res: Response) {
    try {
      const { name, email, username, password } = req.body;

      const organizer = await this.userService.createOrganizer({
        name,
        email,
        username,
        password,
      });
      const { password: _, ...safeOrganizer } = organizer;
      handleSuccess(
        res,
        "Successfully Created a new Organizer.",
        safeOrganizer,
        200
      );
    } catch (error) {
      handleError(
        res,
        "Failed to Create Organizer",
        500,
        (error as Error).message
      );
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

  public getMe = async (req: Request, res: Response) => {
    try {
      const authUser = (req as any).user; // <- you already changed this
      if (!authUser || !authUser.id) {
        return handleError(res, "User not authenticated", 401, "Unauthorized");
      }

      // Get base user info
      const user = await this.userService.getMe(authUser.id);
      if (!user) {
        return handleError(res, "User not found", 404, "Not Found");
      }

      // Get available points from PointService
      const availablePoints = await this.pointService.getAvailablePoints(
        user.id
      );

      // Merge into response
      const userWithPoints = {
        ...user,
        availablePoints,
      };

      handleSuccess(res, "Fetched profile successfully", userWithPoints, 200);
    } catch (err) {
      handleError(res, "Failed to fetch profile", 401, (err as Error).message);
    }
  };

  //cari lewat id:
  public findById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(Number(id));

      handleSuccess(res, "User fetched successfully", user, 200);
    } catch (error) {
      handleError(res, "Failed to fetch user", 404, (error as Error).message);
    }
  };

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
      const { password, ...safeUser } = result;

      return handleSuccess(res, "User updated successfully", safeUser, 200);
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
      const { password, ...safeUser } = result;

      return handleSuccess(res, "User deleted successfully", safeUser, 200);
    } catch (error) {
      return handleError(
        res,
        "Failed to delete user",
        500,
        (error as Error).message
      );
    }
  }
  public async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return handleError(res, "Email is required", 400, "Bad Request");
      }

      const result = await this.userService.forgotPassword(email);
      return handleSuccess(res, "Email sent successfully", result, 200);
    } catch (err) {
      return handleError(
        res,
        "Failed to send reset email",
        400,
        (err as Error).message
      );
    }
  }

  // Reset Password
  public async resetPassword(req: Request, res: Response) {
    try {
      // User ID is set by JwtMiddleware after token verification
      const authUser = res.locals.user;
      if (!authUser || !authUser.id) {
        return handleError(res, "Invalid token payload", 401, "Unauthorized");
      }

      const { password } = req.body;
      if (!password) {
        return handleError(res, "New Password is required", 400, "Bad Request");
      }

      const result = await this.userService.resetPassword(
        authUser.id,
        password
      );
      return handleSuccess(res, "Password reset successfully", result, 200);
    } catch (err) {
      return handleError(
        res,
        "Failed to reset password",
        400,
        (err as Error).message
      );
    }
  }

  public async updatePassword(req: Request, res: Response) {
    try {
      const authUser = res.locals.user; // get logged-in user from auth middleware
      if (!authUser || !authUser.id) {
        return handleError(res, "User not authenticated", 401, "Unauthorized");
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return handleError(
          res,
          "Both passwords are required",
          400,
          "Bad Request"
        );
      }

      const result = await this.userService.updatePasswordWithCurrent(
        authUser.id,
        currentPassword,
        newPassword
      );

      return handleSuccess(res, "Password updated successfully", result, 200);
    } catch (err) {
      return handleError(
        res,
        "Failed to update password",
        400,
        (err as Error).message
      );
    }
  }

  async updateAvatar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return handleError(res, "Invalid user id", 400, "ID must be a number");
      }

      const userId = Number(id);
      const file = req.file as Express.Multer.File;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // 👇 upload to Cloudinary
      const result = await this.cloudinaryService.upload(file);

      const updatedUser = await this.userService.updateAvatar(
        userId,
        result.secure_url, // avatarUrl
        result.public_id // avatarPublicId
      );

      return handleSuccess(
        res,
        "Avatar updated successfully",
        updatedUser,
        200
      );
    } catch (err) {
      handleError(res, "Failed to update avatar", 400, (err as Error).message);
    }
  }
}
