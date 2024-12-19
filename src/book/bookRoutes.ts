import express from "express";
import { createBook } from "./bookRouter";

const bookRouter = express.Router();

bookRouter.get("/create-book", createBook);

export default bookRouter;
