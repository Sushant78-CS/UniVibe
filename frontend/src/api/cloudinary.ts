import { useAuth } from "@clerk/react";
import api from "./axios";

interface CloudinarySignature {
  timestamp: string;
  signature: string;
  apiKey: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format: string;
  resource_type?: string;
}

type MediaType = "IMAGE" | "VIDEO";

export const useCloudinaryApi = () => {
  const { getToken } = useAuth();

  const uploadPostMediaToCloudinary = async (
    file: File,
    mediaType: MediaType,
  ): Promise<CloudinaryUploadResponse> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const resourceType = mediaType === "VIDEO" ? "video" : "image";

    const { data } = await api.get<CloudinarySignature>(
      "/cloudinary/signature",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        params: {
          resourceType,
        },
      },
    );

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Cloudinary cloud name is not configured");
    }

    const folder =
      mediaType === "VIDEO" ? "univibe/post-videos" : "univibe/post-images";

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    return response.json();
  };

  const uploadPostImageToCloudinary = async (
    file: File,
  ): Promise<CloudinaryUploadResponse> => {
    return uploadPostMediaToCloudinary(file, "IMAGE");
  };

  const uploadPostVideoToCloudinary = async (
    file: File,
  ): Promise<CloudinaryUploadResponse> => {
    return uploadPostMediaToCloudinary(file, "VIDEO");
  };

  return {
    uploadPostMediaToCloudinary,
    uploadPostImageToCloudinary,
    uploadPostVideoToCloudinary,
  };
};
