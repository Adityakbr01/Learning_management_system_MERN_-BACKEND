import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import { createCourse } from "./courseController";

const courserouter = express.Router();
courserouter.post("/", isAuthenticated, createCourse);

export default courserouter;
