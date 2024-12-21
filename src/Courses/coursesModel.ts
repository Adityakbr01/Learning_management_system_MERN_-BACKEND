import mongoose, { Document, Schema } from "mongoose";
import { ICourse } from "./courseTypes";

// Define TypeScript interfaces for subdocuments and main document

// Extending mongoose.Document for strict typing when using Mongoose models
export interface ICourseDocument extends ICourse, Document {}

// Create the Mongoose schema
const CourseSchema: Schema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    courseDiscription: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    courseLevel: {
      type: String,
      enum: ["Beginner", "Medium", "Advance"],
    },
    coursePrice: {
      type: Number,
    },
    courseThumbnail: {
      type: String,
    },
    enrolledStudent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Export the Mongoose model with type inference
export const Course = mongoose.model<ICourseDocument>("Course", CourseSchema);
