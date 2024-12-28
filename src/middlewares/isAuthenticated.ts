import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import type { Response, Request, NextFunction } from "express";

// Middleware to parse cookies

// Define the decoded token structure
interface DecodedToken extends JwtPayload {
  userId: string;
}

// Custom Request interface
export interface AuthenticatedRequest extends Request {
  id?: string; // Attach user ID to request
}

const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return next(createHttpError(401, "User not authenticated"));
    }

    // Ensure JWT_SECRET is configured
    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;

      // Validate the decoded payload
      if (!decoded || typeof decoded.userId !== "string") {
        return next(createHttpError(401, "Invalid token"));
      }

      // Attach the user ID to the request
      req.id = decoded.userId;
      next();
    } catch (error: any) {
      // Handle JWT-specific errors
      if (error.name === "TokenExpiredError") {
        return next(createHttpError(401, "Token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(createHttpError(401, "Invalid token"));
      }
      return next(createHttpError(500, "Failed to verify token"));
    }
  } catch (error) {
    // Log and handle unexpected errors
    console.error(error);
    return next(createHttpError(500, "Failed to authenticate user"));
  }
};

export default isAuthenticated;
