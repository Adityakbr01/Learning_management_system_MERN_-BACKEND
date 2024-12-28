import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import type { Response, NextFunction } from "express";
import { AuthenticatedRequest, DecodedToken } from "../types/type";

const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(createHttpError(401, "User not authenticated"));
    }

    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
      if (!decoded?.userId) {
        return next(createHttpError(401, "Invalid token"));
      }

      req.id = decoded.userId; // Attach user ID to the request
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(createHttpError(401, "Token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(createHttpError(401, "Invalid token"));
      }
      return next(createHttpError(500, "Failed to verify token"));
    }
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Failed to authenticate user"));
  }
};

export default isAuthenticated;
