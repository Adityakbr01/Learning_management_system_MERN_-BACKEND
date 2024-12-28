import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { JwtPayload } from "jsonwebtoken";

// Define the decoded token structure
export interface DecodedToken extends JwtPayload {
  userId: string;
}

// Define AuthenticatedRequest with generics and proper constraints
export interface AuthenticatedRequest<
  Params extends ParamsDictionary = ParamsDictionary,
  Body = any,
  Query = Record<string, any>
> extends Request<Params, any, Body, Query> {
  id?: string; // User ID added by middleware
  file?: Express.Multer.File; // Uploaded file
}
