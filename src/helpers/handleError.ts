import { Response } from "express";

export function handleError(
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: unknown
) {
  return res.status(statusCode).json({
    status: false,
    message,
    error
  })
}