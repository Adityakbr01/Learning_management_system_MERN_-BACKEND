import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Course } from "./coursesModel";

// Extend the Request interface to include a custom "id" property
interface AuthenticatedRequest extends Request {
  id?: string; // Assuming "id" is optional and added by middleware
}

const createCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseTitle, category } = req.body;

    // Input validation
    if (!courseTitle || !category) {
      return next(
        createHttpError(400, "Course title and category are required.")
      );
    }

    // Create the course
    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id, // `id` should be added by middleware
    });

    // Respond with success
    res.status(201).json({
      success: true,
      course,
      message: "Course created successfully.",
    });
  } catch (error) {
    console.error("Error creating course:", error);
    next(createHttpError(500, "Failed to create course."));
  }
};

export { createCourse };
