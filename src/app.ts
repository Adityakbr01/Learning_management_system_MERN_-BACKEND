import express from "express";
import { response, request, NextFunction } from "express";

const app = express();

//Routes

//http Methods:
app.get("/", (req, res) => {
  res.send("Workinh");
});

export default app;
