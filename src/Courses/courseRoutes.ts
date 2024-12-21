import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createCourse,
  editCourse,
  getCreatorCourses,
} from "./courseController";
import upload from "../utils/multer";

const courserouter = express.Router();
courserouter.post("/", isAuthenticated, createCourse);
courserouter.get("/", isAuthenticated, getCreatorCourses);
courserouter.put(
  "/:courseId",
  isAuthenticated,
  upload.single("courseThumbnail"),
  editCourse
);

export default courserouter;
