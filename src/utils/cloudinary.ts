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
export const uploadMedia = async (file: string): Promise<UploadApiResponse> => {
  try {
    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
      file,
      {
        resource_type: "auto",
      }
    );
    return uploadResult;
  } catch (error) {
    console.error("Error uploading media to Cloudinary:", error);
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
