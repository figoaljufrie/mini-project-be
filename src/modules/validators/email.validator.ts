import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../helpers/handleError";

export const validateEmail = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0]?.msg || "Invalid input";
      return handleError(res, firstError, 400);
    }
    next();
  },
];