import mongoose, { Schema, Document, Model } from "mongoose";

interface ILectureProgress {
  lectureId: mongoose.Types.ObjectId; // Reference to Lecture model
  viewed: boolean;
}

interface ICourseProgress extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User model
  courseId: mongoose.Types.ObjectId; // Reference to Course model
  completed: boolean;
  lectureProgress: ILectureProgress[];
}

const lectureProgressSchema = new Schema<ILectureProgress>({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  viewed: { type: Boolean, required: true },
});

const courseProgressSchema = new Schema<ICourseProgress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completed: { type: Boolean, default: false },
    lectureProgress: { type: [lectureProgressSchema], default: [] },
  },
  { timestamps: true }
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true }); // Prevent duplicate progress entries

export const CourseProgress: Model<ICourseProgress> =
  mongoose.model<ICourseProgress>("CourseProgress", courseProgressSchema);
