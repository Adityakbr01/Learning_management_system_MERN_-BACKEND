import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import User from "./userModel";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/genrateToken";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary";

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

    // Step 4: Generate a JWT token and send requiset
    generateToken(res, user, `Welcome Back ${user.name}`);
  } catch (error) {
    console.error("Error during login:", error);
    return next(createHttpError(500, "Failed to Login"));
  }
};

const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear the token cookie
    res
      .status(200)
      .cookie("token", "", {
        maxAge: 0, // Immediately expires the cookie
        httpOnly: true, // Helps prevent XSS
        sameSite: "strict", // Prevent CSRF
      })
      .json({
        message: "Logged out successfully",
        success: true,
      });
  } catch (error) {
    console.error("Error during logout:", error);
    next(createHttpError(500, "Failed to log out"));
  }
};
const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.id;

    if (!userId) {
      return next(createHttpError(401, "Unauthorized: Missing user ID"));
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return next(createHttpError(500, "Failed to load user profile"));
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.id; // Assuming the user ID is set by an authentication middleware
    const { name } = req.body;
    const profilePhoto = req.file;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    // If the user already has a photo, delete it from Cloudinary
    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop()?.split(".")[0]; // Extract the publicId
      if (publicId) {
        await deleteMediaFromCloudinary(publicId);
      }
    }

    // Upload the new photo to Cloudinary
    if (profilePhoto) {
      const cloudResponse = await uploadMedia(profilePhoto.path);
      const photoUrl = cloudResponse?.secure_url;

      // Update the user with new data
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, photoUrl },
        { new: true }
      ).select("-password"); // Exclude the password field

      // Send the response
      res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No profile photo uploaded",
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    next(createHttpError(500, "Failed to update profile"));
  }
};

export { registerUser, loginUser, logoutUser, getUserProfile, updateProfile };
