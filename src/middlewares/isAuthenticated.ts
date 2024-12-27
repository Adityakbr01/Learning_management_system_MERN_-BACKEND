import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import { Response, Request, NextFunction } from "express";

// declare module "express-serve-static-core" {
//   interface Request {
//     id?: string;
//   }
// }

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(createHttpError(401, "User not authenticated"));
    }

    if (!config.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

      if (!decoded || !decoded.userId) {
        return next(createHttpError(401, "Invalid token"));
      }

      req.id = decoded.userId;
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
