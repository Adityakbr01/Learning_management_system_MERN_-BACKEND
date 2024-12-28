import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary";
import { Course } from "./coursesModel";
// import { AuthenticatedRequest } from "../middlewares/isAuthenticated";

export interface AuthenticatedRequest extends Request {
  id?: string;
  file?: Express.Multer.File;
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

export interface AuthenticatedRequest extends Request {
  id?: string;
  file?: Express.Multer.File;
}

const getCreatorCourses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.id;

    // Ensure userId exists (from authentication middleware)
    if (!userId) {
      next(createHttpError(401, "Unauthorized access. User ID missing."));
      return; // Stop execution after calling next()
    }

    // Find all courses created by the user
    const courses = await Course.find({ creator: userId });

    // Check if no courses were found
    if (!courses || courses.length === 0) {
      res.status(404).json({
        courses: [],
        message: "No courses found for this creator.",
      });
      return; // Stop execution
    }

    // Respond with the found courses
    res.status(200).json({
      courses,
      message: "Courses retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching creator's courses:", error);
    next(createHttpError(500, "Failed to fetch courses."));
  }
};

// Middleware Function to Edit a Course
const editCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId; // Course ID from request parameters
    const {
      category,
      courseLevel,
      coursePrice,
      courseTitle,
      description,
      subTitle,
    } = req.body; // Course details from request body

    const thumbnail = req.file; // Uploaded thumbnail file

    // Find the course by ID
    let course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    // Handle thumbnail upload and deletion
    let courseThumbnail: string | undefined;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop()?.split(".")[0];
        if (publicId) await deleteMediaFromCloudinary(publicId);
      }
      const uploadResult = await uploadMedia(thumbnail.path);
      courseThumbnail = uploadResult.secure_url;
    }

    // Prepare update data
    const updateData: Partial<typeof course> = {};
    if (category) updateData.category = category;
    if (courseLevel) updateData.courseLevel = courseLevel;
    if (coursePrice) updateData.coursePrice = coursePrice;
    if (courseTitle) updateData.courseTitle = courseTitle;
    if (description) updateData.courseDiscription = description;
    if (subTitle) updateData.subTitle = subTitle;
    if (courseThumbnail) updateData.courseThumbnail = courseThumbnail;

    // Update the course in the database
    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    // Send success response
    res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.error("Error updating course:", error);
    next(createHttpError(500, "Failed to update course"));
  }
};
export interface AuthenticatedRequest extends Request {
  user: any; // Isko apne user model ke according change karein
  file?: Express.Multer.File;
}

// Controller to Get Course by ID
const getCourseById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      next(createHttpError(404, "Course not found")); // Pass 404 error to error handler
      return;
    }

    // Send success response
    res.status(200).json({
      course,
      message: "Course found successfully.",
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    next(createHttpError(500, "Failed to fetch course")); // Pass 500 error to error handler
  }
};

export const togglePublishCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        message: "Course not found!",
      });
      return;
    }

    // Update the publish status based on query parameter
    course.isPublished = publish === "true";

    // Save the updated course
    await course.save();

    // Send a success response
    res.status(200).json({
      message: `Course has been ${
        course.isPublished ? "published" : "unpublished"
      } successfully.`,
      course,
    });
  } catch (error) {
    console.error("Error toggling course publish status:", error);
    next(createHttpError(500, "Failed to update publish status."));
  }
};

const getPublishedCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: "true" }).populate({
      path: "creator",
      select: "name photoUrl",
    });

    if (courses.length === 0) {
      res.status(404).json({
        message: "No published courses found.",
      });
      return;
    }

    res.status(200).json({
      courses,
      message: "Published courses fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching published courses:", error);
    next(createHttpError(500, "Failed to get published courses."));
  }
};

export const searchCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;

    // Parse categories to ensure it's always an array
    const parsedCategories = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? [categories]
      : [];

    // Initialize Search Criteria
    const SearchCriteria: Record<string, any> = {
      isPublished: true,
    };

    // Add query-based matching for title and subtitle
    if (query) {
      SearchCriteria.$or = [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
      ];
    }

    // Add strict category filter if categories are provided
    if (parsedCategories.length > 0) {
      SearchCriteria.category = { $in: parsedCategories };
    }

    // Define Sorting Options
    const sortOptions: { [key: string]: 1 | -1 } = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1; // Ascending order
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1; // Descending order
    }

    console.log("Search Criteria:", SearchCriteria);
    console.log("Sort Options:", sortOptions);

    // Fetch Courses
    const courses = await Course.find(SearchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.error("Error in searchCourse:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while searching for courses.",
    });
  }
};

export {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
  getPublishedCourse,
};

export default getCourseById;
