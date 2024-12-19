import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import User from "./userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/genrateToken";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);

  // Validate input fields
  if (!name || !email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return next(createHttpError(400, "User already exists with this email"));
    }

    // Hash the password
    let hashedPassword: string;

    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return next(createHttpError(500, "Error hashing the password"));
    }

    // Create new user
    try {
      const newUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
      });

      console.log(newUser);

      // Send success response
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      return next(createHttpError(500, "Error creating user"));
    }
  } catch (error) {
    return next(createHttpError(500, "Internal server error"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Step 1: Validate input fields
  if (!email || !password) {
    return next(createHttpError(400, "Email and password are required"));
  }

  try {
    // Step 2: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    // Step 3: Compare the provided password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(createHttpError(401, "Invalid credentials"));
    }

    // Step 4: Generate a JWT token
    generateToken(res, user, `Welcome Back ${user.name}`);
  } catch (error) {
    console.error("Error during login:", error);
    return next(createHttpError(500, "Internal server error"));
  }
};

export { registerUser, loginUser };
