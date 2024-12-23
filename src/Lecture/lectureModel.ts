import mongoose, { Document, Model, Schema } from "mongoose";
import { ILecture } from "./lectureTypes";
const lectureSchema: Schema = new mongoose.Schema<ILecture>(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    publicId: {
      type: String,
    },
    isPreviwFree: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

// Create the model with the typed interface
export const Lecture: Model<ILecture> = mongoose.model<ILecture>(
  "Lecture",
  lectureSchema
);
