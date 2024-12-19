import mongoose from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  photoUrl: string;
  enrolledCourses: mongoose.Schema.Types.ObjectId;
}
