import express, { Request, Response, NextFunction, urlencoded } from "express";
import createHttpError, { HttpError } from "http-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRoutes";
import bookRouter from "./book/bookRoutes";

const app = express();

//--------- Defoult Middleware -----------------
app.use(express.json());
// Middleware to parse URL-encoded bodies with the extended option
app.use(express.urlencoded({ extended: true }));
// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
app.use(cookieParser());

//----------Routes--------------

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
