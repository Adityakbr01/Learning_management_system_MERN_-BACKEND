import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import { error } from "console";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

//Routes

//http Methods:
app.get("/", (req, res) => {
  const err = createHttpError(400, "Somthinh went Wrong");
  throw err;
  res.send("Working");
});

//Global error Handler
app.use(globalErrorHandler);

export default app;
