import { useEffect, useRef, useState } from "react";

import { Camera, Circle, Square, X, RotateCcw } from "lucide-react";

type CameraMode = "PHOTO" | "VIDEO";

interface CameraCaptureProps {
  mode: CameraMode;

  onClose: () => void;

  onPhotoCaptured: (file: File) => void;

  onVideoRecorded: (file: File) => void;

  onRecordingChange: (recording: boolean) => void;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const CameraCapture = ({
  mode,
  onClose,
  onPhotoCaptured,
  onVideoRecorded,
  onRecordingChange,
}: CameraCaptureProps) => {
  // =========================================================
  // REFS
  // =========================================================

  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const recordedChunksRef = useRef<Blob[]>([]);

  // =========================================================
  // STATE
  // =========================================================

  const [recording, setRecording] = useState(false);

  const [starting, setStarting] = useState(true);

  const [cameraError, setCameraError] = useState("");

  // =========================================================
  // UPDATE RECORDING STATE
  // =========================================================

  const updateRecording = (value: boolean) => {
    setRecording(value);
    onRecordingChange(value);
  };

  // =========================================================
  // START CAMERA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        setStarting(true);
        setCameraError("");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
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

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await videoRef.current.play();

          setStarting(false);
        }
      } catch (error) {
        console.error("Camera error:", error);

        setCameraError(
          "Unable to access your camera. Please allow camera permission.",
        );

        setStarting(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      mediaRecorderRef.current = null;
    };
  }, [mode]);

  // =========================================================
  // TAKE PHOTO
  // =========================================================

  const takePhoto = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is not ready yet.");

      return;
    }

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture photo.");

      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to create photo.");

          return;
        }

        const file = new File([blob], `univibe-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        onPhotoCaptured(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  // =========================================================
  // START VIDEO RECORDING
  // =========================================================

  const startRecording = () => {
    const stream = streamRef.current;

    if (!stream) {
      setCameraError("Camera stream is not available.");

      return;
    }

    try {
      recordedChunksRef.current = [];

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        mimeType = "video/webm;codecs=vp9,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mimeType || "video/webm",
        });

        if (blob.size > MAX_VIDEO_SIZE) {
          setCameraError("Recorded video is too large.");

          updateRecording(false);

          return;
        }

        const file = new File([blob], `univibe-video-${Date.now()}.webm`, {
          type: blob.type || "video/webm",

          lastModified: Date.now(),
        });

        updateRecording(false);

        /*
         * IMPORTANT:
         *
         * We only return the recorded
         * file to the parent.
         *
         * We DO NOT upload here.
         */

        onVideoRecorded(file);
      };

      recorder.onerror = () => {
        setCameraError("Something went wrong while recording.");

        updateRecording(false);
      };

      recorder.start(1000);

      updateRecording(true);
    } catch (error) {
      console.error("Recording error:", error);

      setCameraError("Your browser could not start video recording.");

      updateRecording(false);
    }
  };

  // =========================================================
  // STOP VIDEO RECORDING
  // =========================================================

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  // =========================================================
  // CLOSE CAMERA
  // =========================================================

  const handleClose = () => {
    if (recording) {
      stopRecording();
      return;
    }

    onClose();
  };

  // =========================================================
  // CAMERA ERROR
  // =========================================================

  if (cameraError) {
    return (
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-black
          shadow-xl
          dark:border-slate-700
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            bg-black
            px-4
            py-3
            text-white
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Camera size={17} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Camera
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white/10
              transition
              hover:bg-white/20
            "
          >
            <X size={17} />
          </button>
        </div>

        <div
          className="
            flex
            min-h-[420px]
            flex-col
            items-center
            justify-center
            bg-black
            px-8
            text-center
            sm:min-h-[520px]
          "
        >
          <div
            className="
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-500/10
            "
          >
            <Camera size={28} className="text-red-400" />
          </div>

          <p
            className="
              max-w-sm
              text-sm
              text-white
            "
          >
            {cameraError}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="
              mt-5
              rounded-xl
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-900
              transition
              hover:bg-slate-100
            "
          >
            Close Camera
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-black
        shadow-xl
        dark:border-slate-700
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          bg-black
          px-4
          py-3
          text-white
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />

          <span
            className="
              text-sm
              font-semibold
            "
          >
            {mode === "PHOTO"
              ? "Camera"
              : recording
                ? "Recording"
                : "Video Camera"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-white
            transition
            hover:bg-white/20
          "
        >
          <X size={17} />
        </button>
      </div>

      {/* =====================================================
          CAMERA VIEW
      ===================================================== */}

      <div
        className="
          relative
          flex
          min-h-[420px]
          items-center
          justify-center
          bg-black
          sm:min-h-[520px]
        "
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="
            h-full
            min-h-[420px]
            max-h-[65vh]
            w-full
            object-contain
            sm:min-h-[520px]
          "
        />

        {/* ===================================================
            LOADING
        =================================================== */}

        {starting && (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-black
            "
          >
            <RotateCcw
              size={28}
              className="
                animate-spin
                text-white
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-white/70
              "
            >
              Starting camera...
            </p>
          </div>
        )}

        {/* ===================================================
            RECORDING INDICATOR
        =================================================== */}

        {recording && (
          <div
            className="
              absolute
              left-4
              top-4
              flex
              items-center
              gap-2
              rounded-full
              bg-red-500
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
            "
          >
            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-white
              "
            />
            REC
          </div>
        )}
      </div>

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-4
          bg-black
          px-4
          py-5
        "
      >
        {/* ===================================================
            PHOTO BUTTON
        =================================================== */}

        {mode === "PHOTO" && (
          <button
            type="button"
            disabled={starting}
            onClick={takePhoto}
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              border-4
              border-white
              bg-white
              shadow-lg
              transition
              active:scale-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Camera size={25} className="text-slate-900" />
          </button>
        )}

        {/* ===================================================
            START RECORDING
        =================================================== */}

        {mode === "VIDEO" && !recording && (
          <button
            type="button"
            disabled={starting}
            onClick={startRecording}
            className="
                flex
                items-center
                gap-2
                rounded-full
                bg-red-500
                px-6
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-red-600
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
          >
            <Circle size={16} fill="currentColor" />
            Start Recording
          </button>
        )}

        {/* ===================================================
            STOP RECORDING
        =================================================== */}

        {mode === "VIDEO" && recording && (
          <button
            type="button"
            onClick={stopRecording}
            className="
                flex
                items-center
                gap-2
                rounded-full
                bg-white
                px-6
                py-3
                text-sm
                font-bold
                text-red-500
                transition
                active:scale-95
              "
          >
            <Square size={15} fill="currentColor" />
            Stop Recording
          </button>
        )}
      </div>

      {/* =====================================================
          HIDDEN CANVAS
      ===================================================== */}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
