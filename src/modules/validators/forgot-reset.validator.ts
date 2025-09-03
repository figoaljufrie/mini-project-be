// modules/users/validators/forgot-reset.validator.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../helpers/handleError";

export const validateResetPassword = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  // body("token").notEmpty().withMessage("Token is required").isString(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0]?.msg || "Invalid input";
      return handleError(res, firstError, 400);
    }
    next();
  },
];
