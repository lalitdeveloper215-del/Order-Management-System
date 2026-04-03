import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.warn(`Validation Error: ${JSON.stringify(err.issues)}`);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues,
    });
  }

  logger.error(`Internal Server Error: ${err.message}`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
