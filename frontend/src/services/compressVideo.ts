import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) {
    return ffmpeg;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const instance = new FFmpeg();

    console.log("Loading FFmpeg from local ESM files...");

    const baseURL = `${window.location.origin}/ffmpeg`;

    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript",
    );

    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm",
    );

    await instance.load({
      coreURL,
      wasmURL,
    });

    console.log("FFmpeg loaded successfully.");

    ffmpeg = instance;

    return instance;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
};

export const compressVideo = async (file: File): Promise<File> => {
  if (!file.type.startsWith("video/")) {
    throw new Error("Invalid video file.");
  }

  console.log(`Original video: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

  const instance = await loadFFmpeg();

  const extension = file.name.split(".").pop()?.toLowerCase() || "webm";

  const inputName = `input.${extension}`;
  const outputName = "univibe-compressed.mp4";

  try {
    await instance.writeFile(inputName, await fetchFile(file));

    console.log("Starting video compression...");

    await instance.exec([
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "28",
      "-vf",
      "scale='min(1280,iw)':-2",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputName,
    ]);

    const data = await instance.readFile(outputName);

    const blob = new Blob([data as BlobPart], {
      type: "video/mp4",
    });

    const compressedFile = new File([blob], `univibe-${Date.now()}.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });

    console.log(
      `Compressed video: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );

    return compressedFile;
  } finally {
    try {
      await instance.deleteFile(inputName);
    } catch {
      // Ignore cleanup errors
    }

    try {
      await instance.deleteFile(outputName);
    } catch {
      // Ignore cleanup errors
    }
  }
};
