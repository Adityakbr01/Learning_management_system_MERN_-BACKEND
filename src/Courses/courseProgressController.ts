import mongoose from "mongoose";
import { Lecture } from "../Lecture/lectureModel";
import { CourseProgress } from "./courseProgressModel";
import { Course } from "./coursesModel";
import { Request, Response, NextFunction } from "express";

export const getCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Return type should be void
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Validate inputs
    if (!courseId || !userId) {
      res.status(400).json({ message: "Invalid request parameters" });
      return; // Prevent further execution after sending the response
    }

    // Step 1: Fetch the user's course progress
    const courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate("lectures");
    // If course not found
    // if (!courseProgress) {
    //   const courseDetails = await Course.findById(courseId).populate(
    //     "lectures"
    //   );
    //   console.log("Course Details:", courseDetails);

    //   if (!courseDetails) {
    //     res.status(404).json({ message: "Course not found" });
    //     return; // Prevent further execution after sending the response
    //   }

    //   // Step 2: Return course details with empty progress
    //   res.status(200).json({
    //     data: {
    //       courseDetails,
    //       progress: [],
    //       completed: false,
    //     },
    //   });
    //   return;
    // }

    if (!courseDetails) {
      res.status(404).json({ message: "Course not found" });
      return; // Prevent further execution after sending the response
    }

    if (!courseProgress) {
      console.log("Hited");
      res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
        },
      });
      return;
    }

    // Step 3: Return the user's course progress along with course details
    res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLectureProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Return type should be void
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    // Validate inputs
    if (!courseId || !lectureId || !userId) {
      res.status(400).json({ message: "Invalid request parameters" });
      return; // Prevent further execution after sending the response
    }

    // Fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      // If no progress exists, create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // Find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId.toString() === lectureId // Convert ObjectId to string
    );

    if (lectureIndex !== -1) {
      // If lecture already exists, update its status
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      // Add new lecture progress
      const lectureObjectId = new mongoose.Types.ObjectId(lectureId);
      courseProgress.lectureProgress.push({
        lectureId: lectureObjectId,
        viewed: true,
      });
    }

    // Check if all lectures are completed
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lecturepro) => lecturepro.viewed
    ).length;
    const course = await Course.findById(courseId);

    if (course?.lectures?.length === lectureProgressLength) {
      // Mark the course as completed
      courseProgress.completed = true;
      await courseProgress.save();
    }

    // Save the updated progress
    await courseProgress.save();

    res.status(200).json({
      message: "Lecture progress updated successfully",
      courseProgress,
    });
  } catch (error) {
    console.error("Error updating lecture progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Change return type to Promise<void>
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Fetch course progress
    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      res.status(404).json({
        message: "Course progress not found",
      });
      return; // Early return after sending the response
    }

    // Mark all lecture progress as viewed
    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = true)
    );

    // Mark course as completed
    courseProgress.completed = true;
    await courseProgress.save();

    // Send success response
    res.status(200).json({
      message: "Course marked as completed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsInCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Change return type to Promise<void>
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Fetch course progress
    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      res.status(404).json({
        message: "Course progress not found",
      });
      return; // Early return after sending the response
    }

    // Mark all lecture progress as not viewed
    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = false)
    );

    // Mark course as incomplete
    courseProgress.completed = false;
    await courseProgress.save();

    // Send success response
    res.status(200).json({
      message: "Course marked as Incompleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
