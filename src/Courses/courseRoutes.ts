import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated";
import {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
  getPublishedCourse,
  searchCourse,
  togglePublishCourse,
} from "./courseController";
import upload from "../utils/multer";
import {
  createLecture,
  editLecture,
  getCourseLecture,
  getLectureById,
  removeLecture,
} from "../Lecture/lectureController";
import { uploadMedia } from "../utils/cloudinary";
import createHttpError from "http-errors";

const courserouter = express.Router();
courserouter.post("/", isAuthenticated, createCourse);
courserouter.get("/search", isAuthenticated, searchCourse);
courserouter.get("/", isAuthenticated, getCreatorCourses);
courserouter.get("/publishedCourse", getPublishedCourse);
courserouter.put(
  "/:courseId",
  isAuthenticated,
  upload.single("courseThumbnail"),
  editCourse
);
courserouter.get("/:courseId", isAuthenticated, getCourseById);
courserouter.post("/:courseId/lecture", isAuthenticated, createLecture);
courserouter.get("/:courseId/lecture", isAuthenticated, getCourseLecture);
courserouter.post(
  "/upload-video",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const result = await uploadMedia(req.file?.path as string);
      res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(createHttpError(500, "Upload media ."));
    }
  }
);

courserouter.post(
  "/:courseId/lecture/:lectureId",
  isAuthenticated,
  editLecture
);
courserouter.delete("/lecture/:lectureId", isAuthenticated, removeLecture);
courserouter.get("/lecture/:lectureId", isAuthenticated, getLectureById);
courserouter.patch("/:courseId", isAuthenticated, togglePublishCourse);

export default courserouter;
