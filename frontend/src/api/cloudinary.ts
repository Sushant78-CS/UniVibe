import { useAuth } from "@clerk/react";
import api from "./axios";

interface CloudinarySignature {
  timestamp: string;
  signature: string;
  apiKey: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

export const useCloudinaryApi = () => {
  const { getToken } = useAuth();

  const uploadPostImageToCloudinary = async (
    file: File,
  ): Promise<CloudinaryUploadResponse> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    // Get signed upload parameters from Spring Boot
    const { data } = await api.get<CloudinarySignature>(
      "/cloudinary/signature",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Cloudinary cloud name is not configured");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("folder", "univibe/post-images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }

    return response.json();
  };

  return {
    uploadPostImageToCloudinary,
  };
};
