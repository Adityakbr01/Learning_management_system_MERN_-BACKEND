import express from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from "./userController";
import isAuthenticated from "../middlewares/isAuthenticated";
import upload from "../utils/multer";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", isAuthenticated, getUserProfile);
userRouter.get("/logout", logoutUser);
userRouter.put(
  "/profile/update",
  isAuthenticated,
  upload.single("profilePhoto"),
  updateProfile
);

export default userRouter;
