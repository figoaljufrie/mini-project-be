import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../../helpers/handleError";

export const validateName = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0]?.msg || "Invalid input";
      return handleError(res, firstError, 400);
    }
    next();
  },
];