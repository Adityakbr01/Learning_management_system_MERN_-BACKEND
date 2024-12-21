import mongoose from "mongoose";

export interface ICourse {
  courseTitle: string;
  subTitle?: string;
  courseDiscription?: string;
  category: string;
  courseLevel?: "Beginner" | "Medium" | "Advance";
  coursePrice?: number;
  courseThumbnail?: string;
  enrolledStudent?: mongoose.Types.ObjectId[];
  lectures?: mongoose.Types.ObjectId[];
  creator?: mongoose.Types.ObjectId;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
