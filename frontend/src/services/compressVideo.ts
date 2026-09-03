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

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    ffmpeg = instance;

    return instance;
  })();

  return loadingPromise;
};

export const compressVideo = async (file: File): Promise<File> => {
  if (!file.type.startsWith("video/")) {
    throw new Error("Invalid video file.");
  }

  const instance = await loadFFmpeg();

  const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";

  const inputName = `input.${extension}`;
  const outputName = "univibe-compressed.mp4";

  try {
    await instance.writeFile(inputName, await fetchFile(file));

    await instance.exec([
      "-i",
      inputName,

      // H.264 video
      "-c:v",
      "libx264",

      // Good compression/quality balance
      "-crf",
      "28",

      // Encoding speed
      "-preset",
      "veryfast",

      // Maximum width 1280px
      "-vf",
      "scale='min(1280,iw)':-2",

      // AAC audio
      "-c:a",
      "aac",

      "-b:a",
      "128k",

      // Better web playback
      "-movflags",
      "+faststart",

      outputName,
    ]);

    const data = await instance.readFile(outputName);

    const blob = new Blob([data as BlobPart], {
      type: "video/mp4",
    });

    return new File([blob], `univibe-${Date.now()}.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });
  } finally {
    try {
      await instance.deleteFile(inputName);
    } catch {
      // Ignore cleanup error
    }

    try {
      await instance.deleteFile(outputName);
    } catch {
      // Ignore cleanup error
    }
  }
};
