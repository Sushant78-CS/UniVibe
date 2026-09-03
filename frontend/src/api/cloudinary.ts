import { useAuth } from "@clerk/react";
import api from "./axios";

interface CloudinarySignature {
  timestamp: string;
  signature: string;
  apiKey: string;
}

export interface CloudinaryUploadProgress {
  secure_url: string;
  public_id: string;
  resource_type: string;
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

  const uploadPostMediaToCloudinaryWithProgress = async (
    file: File,
    mediaType: "IMAGE" | "VIDEO",
    onProgress: (progress: number) => void,
  ): Promise<CloudinaryUploadProgress> => {
    const resourceType = mediaType === "VIDEO" ? "video" : "image";

    /*
     * Get signed upload parameters from backend.
     */
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const signatureResponse = await api.get<{
      timestamp: string;
      signature: string;
      apiKey: string;
    }>("/cloudinary/signature", {
      params: {
        resourceType,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { timestamp, signature, apiKey } = signatureResponse.data;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Cloudinary cloud name is not configured.");
    }

    const folder =
      mediaType === "VIDEO" ? "univibe/post-videos" : "univibe/post-images";

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", uploadUrl, true);

      /*
       * Real upload percentage.
       */
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const progress = (event.loaded / event.total) * 100;

        onProgress(progress);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            resolve({
              secure_url: response.secure_url,
              public_id: response.public_id,
              resource_type: response.resource_type,
            });
          } catch {
            reject(new Error("Invalid response from Cloudinary."));
          }

          return;
        }

        try {
          const response = JSON.parse(xhr.responseText);

          reject(
            new Error(response?.error?.message || "Cloudinary upload failed."),
          );
        } catch {
          reject(new Error(`Cloudinary upload failed (${xhr.status}).`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error while uploading media."));
      };

      xhr.onabort = () => {
        reject(new Error("Media upload was cancelled."));
      };

      xhr.send(formData);
    });
  };

  return {
    uploadPostMediaToCloudinary,
    uploadPostImageToCloudinary,
    uploadPostVideoToCloudinary,
    uploadPostMediaToCloudinaryWithProgress,
  };
};
