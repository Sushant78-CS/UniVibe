import axios from "axios";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export type VibeMediaType = "IMAGE" | "GIF" | "PDF";

export interface VibeUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

export const uploadVibeMedia = async (
  file: File,
  mediaType: VibeMediaType,
): Promise<VibeUploadResult | null> => {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary cloud name is not configured.");
  }

  if (!UPLOAD_PRESET) {
    throw new Error("Cloudinary upload preset is not configured.");
  }

  const formData = new FormData();

  formData.append("file", file);

  formData.append("upload_preset", UPLOAD_PRESET);

  const resourceType = mediaType === "PDF" ? "raw" : "image";

  try {
    const response = await axios.post<VibeUploadResult>(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      formData,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Cloudinary status:", error.response?.status);

      console.error("Cloudinary error:", error.response?.data);
    }

    console.error("Vibe Cloudinary upload failed:", error);

    return null;
  }
};
