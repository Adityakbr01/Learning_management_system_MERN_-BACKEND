import express from "express";
import { registerUser } from "./userController";

const userRouter = express.Router();

userRouter.get("/register", registerUser);

export default userRouter;
