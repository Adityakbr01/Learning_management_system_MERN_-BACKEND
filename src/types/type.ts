import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { JwtPayload } from "jsonwebtoken";
import { ParsedQs } from "qs";
// Define the decoded token structure
export interface DecodedToken extends JwtPayload {
  userId: string;
}

// Define AuthenticatedRequest with generics and proper constraints
export interface AuthenticatedRequest<
  Params extends ParamsDictionary = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  id?: string; // User ID added by authentication middleware
  file?: Express.Multer.File; // Uploaded file
  // cookies?: Record<string, any>; // Ensure cookies are properly typed
}
