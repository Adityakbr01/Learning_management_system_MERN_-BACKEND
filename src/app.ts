import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import { error } from "console";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRoutes";
import bookRouter from "./book/bookRoutes";

const app = express();

//Routes

//http Methods:
app.get("/", (req, res) => {
  const err = createHttpError(400, "Somthinh went Wrong");
  throw err;
  res.send("Working");
});

//Routes
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

//Global error Handler
app.use(globalErrorHandler);

export default app;
