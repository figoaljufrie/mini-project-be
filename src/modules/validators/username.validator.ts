import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../helpers/handleError";

export const validateUsername = [
  body("username")
    .notEmpty().withMessage("Username is required")
    .isString().withMessage("Username must be a string")
    .isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_.]+$/).withMessage("Username can only contain letters, numbers, underscores, and dots"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0]?.msg || "Invalid input";
      return handleError(res, firstError, 400);
    }
    next();
  },
];