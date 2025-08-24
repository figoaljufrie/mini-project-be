// modules/users/validators/forgot-reset.validator.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../../helpers/handleError";

export const validateResetPassword = [
  body("password").notEmpty().withMessage("Password is required").isString(),
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
