import { Request, Response, NextFunction } from "express";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send("Working");
};

export { registerUser };
