import { Document } from "mongoose";

export interface ILecture extends Document {
  lectureTitle: string;
  videoUrl?: string;
  publicId?: string;
  isPreviwFree?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
