import express from "express";
import { getUserProfile, loginUser, logoutUser, registerUser } from "./userController";
import isAuthenticated from "../middlewares/isAuthenticated";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", isAuthenticated, getUserProfile);
userRouter.get("/logout", isAuthenticated, logoutUser);

export default userRouter;
