import mongoose from "mongoose";

export interface User {
  _id: mongoose.Schema.Types.ObjectId; // ObjectId type for _id
  name: string;
  email: string;
  password: string;
  role: string;
  photoUrl?: string; // Optional field, depending on your schema
  enrolledCourses: mongoose.Schema.Types.ObjectId[]; 
}




