import mongoose from "mongoose";
import { config } from "./config";

const connectDb = async () => {
  try {
    await mongoose.connect(config.dataBaseUrl as string);
    console.log("Database connected successfully...");
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("Connected to database successfully.");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Error in connecting to database:", err);
  });
};

export default connectDb;
