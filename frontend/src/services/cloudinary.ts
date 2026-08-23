import axios from "axios";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
    );

    return response.data.secure_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Status:", error.response?.status);
      console.log("Cloudinary Error:", error.response?.data);
    }

    console.error("Image upload failed:", error);

    return null;
  }
};
