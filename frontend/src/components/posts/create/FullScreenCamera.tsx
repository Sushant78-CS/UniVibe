import {
  Camera,
  CameraOff,
  Circle,
  FlipHorizontal,
  Loader2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FullScreenCameraProps {
  mode: "PHOTO" | "VIDEO";

  onClose: () => void;

  onPhotoCaptured: (file: File) => void;

  onVideoRecorded: (file: File) => void;
}

const getSupportedVideoMimeType = () => {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
};

export default function FullScreenCamera({
  mode,
  onClose,
  onPhotoCaptured,
  onVideoRecorded,
}: FullScreenCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const mountedRef = useRef(true);

  const cameraRequestRef = useRef(0);

  const recordingTimerRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const [recording, setRecording] = useState(false);

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  /*
   * Stop a specific stream.
   */
  const stopSpecificStream = (stream: MediaStream | null) => {
    if (!stream) {
      return;
    }

    stream.getTracks().forEach((track) => {
      track.stop();
    });
  };

  /*
   * Stop the currently active camera.
   */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      stopSpecificStream(streamRef.current);

      streamRef.current = null;
    }

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, []);

  /*
   * Start camera safely.
   *
   * The request ID prevents an older getUserMedia()
   * request from replacing a newer stream.
   */
  const startCamera = useCallback(async () => {
    const requestId = ++cameraRequestRef.current;

    setLoading(true);
    setError("");

    /*
     * Stop the current active stream before requesting
     * another camera.
     */
    stopStream();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: facingMode,
          },
          width: {
            ideal: 1920,
          },
          height: {
            ideal: 1080,
          },
        },
        audio: mode === "VIDEO",
      });

      /*
       * If another camera request started while this
       * request was waiting, discard this stream.
       */
      if (!mountedRef.current || requestId !== cameraRequestRef.current) {
        stopSpecificStream(stream);
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stopSpecificStream(stream);
        return;
      }

      video.srcObject = stream;

      /*
       * Wait until the video element has metadata before
       * calling play().
       *
       * This avoids:
       * "The play() request was interrupted by a new load request"
       */
      await new Promise<void>((resolve, reject) => {
        const handleLoadedMetadata = async () => {
          try {
            await video.play();
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata, {
          once: true,
        });

        /*
         * Sometimes metadata is already available.
         */
        if (video.readyState >= 1) {
          void handleLoadedMetadata();
        }
      });

      /*
       * Make sure this request is still the active one.
       */
      if (!mountedRef.current || requestId !== cameraRequestRef.current) {
        stopSpecificStream(stream);

        if (streamRef.current === stream) {
          streamRef.current = null;
        }

        return;
      }

      setLoading(false);
    } catch (err) {
      /*
       * Ignore stale requests.
       */
      if (!mountedRef.current || requestId !== cameraRequestRef.current) {
        return;
      }

      console.error("Camera error:", err);

      const cameraError = err instanceof DOMException ? err.name : "";

      if (cameraError === "NotAllowedError") {
        setError(
          "Camera permission was denied. Please allow camera access and try again.",
        );
      } else if (cameraError === "NotFoundError") {
        setError("No camera was found on this device.");
      } else if (cameraError === "NotReadableError") {
        setError("The camera is currently being used by another application.");
      } else if (cameraError === "AbortError") {
        setError(
          "The camera was interrupted while starting. Please try again.",
        );
      } else {
        setError(
          "Camera access was denied or unavailable. Please allow camera permission and try again.",
        );
      }

      setLoading(false);
    }
  }, [facingMode, mode, stopStream]);

  /*
   * Camera lifecycle.
   */
  useEffect(() => {
    mountedRef.current = true;

    void startCamera();

    return () => {
      mountedRef.current = false;

      /*
       * Invalidate any pending camera request.
       */
      cameraRequestRef.current++;

      stopStream();

      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);

        recordingTimerRef.current = null;
      }

      const recorder = recorderRef.current;

      if (recorder && recorder.state === "recording") {
        recorder.ondataavailable = null;
        recorder.onstop = null;

        try {
          recorder.stop();
        } catch {
          // Already stopped.
        }
      }

      recorderRef.current = null;
    };
  }, [startCamera, stopStream]);

  /*
   * Switch front/rear camera.
   */
  const switchCamera = () => {
    if (recording || loading) {
      return;
    }

    setFacingMode((current) =>
      current === "environment" ? "user" : "environment",
    );
  };

  /*
   * Capture photo.
   */
  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !streamRef.current) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    /*
     * Mirror the captured image when using the
     * front-facing camera.
     */
    if (facingMode === "user") {
      context.translate(width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const file = new File([blob], `univibe-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        stopStream();

        onPhotoCaptured(file);
      },
      "image/jpeg",
      0.9,
    );
  };

  /*
   * Start video recording.
   */
  const startRecording = () => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const mimeType = getSupportedVideoMimeType();

    try {
      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });

        const file = new File([blob], `univibe-video-${Date.now()}.webm`, {
          type: blob.type,
          lastModified: Date.now(),
        });

        chunksRef.current = [];

        setRecording(false);
        setRecordingSeconds(0);

        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);

          recordingTimerRef.current = null;
        }

        recorderRef.current = null;

        stopStream();

        onVideoRecorded(file);
      };

      recorder.onerror = () => {
        setError("Something went wrong while recording the video.");

        setRecording(false);

        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);

          recordingTimerRef.current = null;
        }
      };

      recorder.start();

      recorderRef.current = recorder;

      setRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (err) {
      console.error("Unable to start recording:", err);

      setError("Video recording is not supported by this browser.");
    }
  };

  /*
   * Stop video recording.
   */
  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (!recorder) {
      return;
    }

    if (recorder.state === "recording") {
      recorder.stop();
    }
  };

  /*
   * Main camera button.
   */
  const handleMainAction = () => {
    if (loading || error) {
      return;
    }

    if (mode === "PHOTO") {
      capturePhoto();
      return;
    }

    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /*
   * Close camera without keeping a recording.
   */
  const handleClose = () => {
    cameraRequestRef.current++;

    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);

      recordingTimerRef.current = null;
    }

    const recorder = recorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.ondataavailable = null;
      recorder.onstop = null;

      try {
        recorder.stop();
      } catch {
        // Already stopped.
      }
    }

    recorderRef.current = null;

    chunksRef.current = [];

    setRecording(false);

    stopStream();

    onClose();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black text-white">
      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 h-full w-full object-cover ${
          facingMode === "user" ? "-scale-x-100" : ""
        }`}
      />

      {/* Dark top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Dark bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin" />

            <p className="text-sm text-white/80">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <CameraOff className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-semibold">Camera unavailable</h2>

            <p className="mt-2 text-sm leading-6 text-white/70">{error}</p>

            <button
              type="button"
              onClick={() => {
                void startCamera();
              }}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Try again
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="mt-3 block w-full py-3 text-sm text-white/70 transition hover:text-white"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute inset-x-0 top-0 z-20">
        <div className="flex items-center justify-between px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition hover:bg-black/60"
            aria-label="Close camera"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium backdrop-blur-md">
            {mode === "PHOTO" ? "Take photo" : "Record video"}
          </div>

          <button
            type="button"
            onClick={switchCamera}
            disabled={recording || loading || !!error}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Switch camera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      {recording && (
        <div className="absolute left-1/2 top-[max(5rem,env(safe-area-inset-top)+4rem)] z-20 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold shadow-lg">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />

            <span>{formatTime(recordingSeconds)}</span>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="flex flex-col items-center pb-[max(2rem,env(safe-area-inset-bottom))] pt-16">
          {mode === "VIDEO" && (
            <p className="mb-5 text-sm font-medium text-white/80">
              {recording ? "Tap to stop recording" : "Tap to start recording"}
            </p>
          )}

          <button
            type="button"
            onClick={handleMainAction}
            disabled={loading || !!error}
            aria-label={
              mode === "PHOTO"
                ? "Capture photo"
                : recording
                  ? "Stop recording"
                  : "Start recording"
            }
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/90 bg-white/10 shadow-2xl backdrop-blur-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mode === "PHOTO" ? (
              <Camera className="h-8 w-8 text-white transition group-hover:scale-105" />
            ) : recording ? (
              <span className="h-8 w-8 rounded-md bg-red-500" />
            ) : (
              <Circle className="h-10 w-10 fill-red-500 text-red-500" />
            )}
          </button>

          <div className="mt-5 text-xs text-white/60">
            {mode === "PHOTO" ? "Capture" : recording ? "Recording" : "Record"}
          </div>
        </div>
      </div>
    </div>
  );
}
