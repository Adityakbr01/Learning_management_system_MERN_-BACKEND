import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose, { ObjectId } from "mongoose";
import { Course } from "../Courses/coursesModel";
import { Lecture } from "./lectureModel";
import { Request, Response, NextFunction } from "express";
import { deleteVideoFromCloudinary } from "../utils/cloudinary";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  id?: string;
}

export const createLecture: RequestHandler<
  { courseId: string },
  any,
  { lectureTitle: string }
> = async (req, res, next) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return next(
        createHttpError(400, "Lecture title and course ID are required.")
      );
    }

    // Create Lecture
    const lecture = await Lecture.create({ lectureTitle });

    // Find the associated course
    const course = await Course.findById(courseId);
    if (!course) {
      return next(createHttpError(404, "Course not found."));
    }

    // Ensure lectures array exists
    if (!Array.isArray(course.lectures)) {
      course.lectures = [];
    }

    // Add the lecture ID to the course's lectures array
    course.lectures.push(lecture._id as mongoose.Types.ObjectId);
    await course.save();

    // Respond with success
    res.status(201).json({
      lecture,
      message: "Lecture created successfully.",
    });
  } catch (error) {
    console.error("Error creating lecture:", error);
    next(createHttpError(500, "Failed to create lecture."));
  }
};

// export const getCourseLecture = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const courseId = req.params;
//     const course = await Course.findById(courseId).populate("lectures");
//     if (!course) {
//       return next(createHttpError(404, "Leactures not Found."));
//     }

//     return res.status(200).json({
//       lectures: course.lectures,
//       message: "Lectures Founded",
//     });
//   } catch (error) {
//     console.error("Error Geting lectures:", error);
//     next(createHttpError(500, "Failed to Get lectures."));
//   }
// };

// export const getCourseLecture = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Extract the courseId from the request parameters
//     const { courseId } = req.params;

//     // Validate courseId
//     if (!courseId) {
//       return next(createHttpError(400, "Course ID is required."));
//     }

//     // Find the course by ID and populate the lectures
//     const course = await Course.findById(courseId).populate("lectures").exec();

//     if (!course) {
//       return next(createHttpError(404, "Course not found."));
//     }

//     // Respond with the lectures
//     return res.status(200).json({
//       lectures: course.lectures,
//       message: "Lectures found successfully.",
//     });
//   } catch (error) {
//     console.error("Error fetching lectures:", error);
//     return next(createHttpError(500, "Failed to fetch lectures."));
//   }
// };

export const getCourseLecture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract the courseId from the request parameters
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      return next(createHttpError(400, "Course ID is required."));
    }

    // Find the course by ID and populate the lectures
    const course = await Course.findById(courseId).populate("lectures").exec();

    if (!course) {
      return next(createHttpError(404, "Course not found."));
    }

    // Respond with the lectures
    res.status(200).json({
      lectures: course.lectures,
      message: "Lectures found successfully.",
    });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return next(createHttpError(500, "Failed to fetch lectures."));
  }
};

export const editLecture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    console.log(lectureTitle, videoInfo, isPreviewFree);
    const { courseId, lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      res.status(404).json({ message: "Lecture not found!" });
      return;
    }

    // Check if a video already exists and delete it from Cloudinary
    if (lecture.publicId && videoInfo?.publicId !== lecture.publicId) {
      try {
        await deleteVideoFromCloudinary(lecture.publicId);
        console.log("Existing video deleted from Cloudinary.");
      } catch (cloudinaryError) {
        console.error(
          "Failed to delete video from Cloudinary:",
          cloudinaryError
        );
      }
    }

    // Updating lecture properties
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviwFree = isPreviewFree;

    await lecture.save();

    // Ensure the course still has the lecture ID if it was not already added
    const course = await Course.findById(courseId);
    if (course && !course.lectures?.includes(lecture._id as Types.ObjectId)) {
      course?.lectures?.push(lecture._id as Types.ObjectId);
      await course.save();
    }

    res.status(200).json({
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.error(`Error in editLecture: ${error}`);
    next(createHttpError(500, "Failed to edit lecture."));
  }
};

export const removeLecture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lectureId } = req.params;

    // Find and delete the lecture by ID
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      res.status(404).json({
        message: `Lecture with ID ${lectureId} not found.`,
      });
      return;
    }

    // Delete the lecture's video from Cloudinary
    if (lecture.publicId) {
      try {
        await deleteVideoFromCloudinary(lecture.publicId);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete video from Cloudinary: ${cloudinaryError}`
        );
      }
    }

    // Remove the lecture reference from the associated course
    await Course.updateOne(
      { lectures: lectureId }, // Find the course that contains the lecture
      { $pull: { lectures: lectureId } }
    );

    // Send success response
    res.status(200).json({
      message: `Lecture with ID ${lectureId} deleted successfully.`,
    });
  } catch (error) {
    console.error(`Error in removeLecture: ${error}`);
    next(createHttpError(500, "Failed to delete lecture."));
  }
};

export const getLectureById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lectureId } = req.params;

    // Find the lecture by ID
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      res.status(404).json({
        message: `Lecture with ID ${lectureId} not found.`,
      });
      return;
    }

    // Send the lecture details as a response
    res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.error(`Error in getLectureById: ${error}`);
    next(createHttpError(500, "Failed to get lecture."));
  }
};
