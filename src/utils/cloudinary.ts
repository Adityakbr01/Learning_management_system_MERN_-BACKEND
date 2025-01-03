import fs from "fs/promises";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { config } from "../config/config";

// Configure Cloudinary
cloudinary.config({
  api_key: config.cloudinary_API_key,
  api_secret: config.cloudinary_API_Secret,
  cloud_name: config.Cloudinary_Name,
});

/**
 * Upload media to Cloudinary
 * @param file - The file path or Base64 string to upload
 * @returns Cloudinary upload result
 * @throws Error if the upload fails
 */

// Function to upload media to Cloudinary and delete the local file
export const uploadMedia = async (file: string): Promise<UploadApiResponse> => {
  try {
    // Upload the file to Cloudinary
    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
      file,
      {
        resource_type: "auto",
      }
    );

    // Delete the local file after successful upload
    await fs.unlink(file);
    console.log(`Local file ${file} deleted successfully.`);

    return uploadResult;
  } catch (error) {
    console.error("Error uploading media to Cloudinary:", error);

    // Attempt to delete the local file even if the upload fails
    try {
      await fs.unlink(file);
      console.log(`Local file ${file} deleted after upload failure.`);
    } catch (unlinkError) {
      console.error(`Error deleting local file ${file}:`, unlinkError);
    }

    throw error as UploadApiErrorResponse; // Ensure proper error typing
  }
};

/**
 * Delete a media file from Cloudinary
 * @param publicId - The public ID of the media to delete
 * @returns Cloudinary deletion result
 * @throws Error if the deletion fails
 */
export const deleteMediaFromCloudinary = async (
  publicId: string
): Promise<{ result: string }> => {
  try {
    const deleteResult: { result: string } = await cloudinary.uploader.destroy(
      publicId
    );
    return deleteResult;
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
    throw error as UploadApiErrorResponse; // Ensure proper error typing
  }
};

/**
 * Delete a video file from Cloudinary
 * @param publicId - The public ID of the video to delete
 * @returns Cloudinary deletion result
 * @throws Error if the deletion fails
 */
export const deleteVideoFromCloudinary = async (
  publicId: string
): Promise<{ result: string }> => {
  try {
    const deleteResult: { result: string } = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "video",
      }
    );
    return deleteResult;
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
    throw error as UploadApiErrorResponse; // Ensure proper error typing
  }
};
