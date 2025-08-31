import { Request, Response, NextFunction } from "express";
import { UserService } from "../modules/users/services/user.service";

export class AuthMiddleware {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.authenticate = this.authenticate.bind(this);
  }

  public async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new Error("Authorization header is missing.");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new Error("Token is Missing.");
      }
      const user = await this.userService.validateToken(token);
      (req as any).user = user;

      next();
    } catch (error) {
      res.status(401).json({
        message: (error as Error).message,
      });
    }
  }
}

// Export function untuk digunakan di router
export const authMiddleware = new AuthMiddleware().authenticate;

// Middleware untuk memastikan user adalah organizer
export const organizerOnly = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    if (user.role !== 'ORGANIZER') {
      return res.status(403).json({ message: "Access denied. Organizer role required." });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
