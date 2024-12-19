import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Response } from "express"; // Import Response from express

export const generateToken = (res: Response, user: any, message: string) => {
  // Create JWT token
  const token = jwt.sign({ userId: user._id }, config.JWT_SECRET as string, {
    expiresIn: "1d", // Expiry of the token (1 day)
  });

  // Set the cookie with the token and specify cookie options
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true, // Prevent access via JavaScript
      sameSite: "strict", // Ensures cookie is only sent in a first-party context
      maxAge: 24 * 60 * 60 * 1000, // Set cookie expiry (1 day)
    })
    .json({
      success: true,
      message,
      user, // Send user data (excluding sensitive data like password)
    });
};
