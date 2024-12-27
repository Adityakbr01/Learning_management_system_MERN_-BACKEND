// src/types/custom.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      id?: string; // Add other custom properties if needed
    }
  }
}
