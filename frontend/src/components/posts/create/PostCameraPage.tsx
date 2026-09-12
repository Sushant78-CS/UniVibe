import { useEffect, useRef, type ChangeEvent } from "react";

import { useLocation, useNavigate } from "react-router";

import { useCreatePostDraftStore } from "../../../store/createPostDraftStore";

export default function PostCameraPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const setMedia = useCreatePostDraftStore((state) => state.setMedia);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const params = new URLSearchParams(location.search);

  const requestedMode = params.get("mode");

  const mode = requestedMode === "video" ? "VIDEO" : "PHOTO";

  /*
   * =========================================================
   * OPEN NATIVE CAMERA
   * =========================================================
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.click();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * =========================================================
   * CAPTURE RESULT
   * =========================================================
   */

  const handleCapture = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      navigate("/posts/create", {
        replace: true,
      });

      return;
    }

    /*
     * PHOTO
     */

    if (mode === "PHOTO") {
      if (!file.type.startsWith("image/")) {
        navigate("/posts/create", {
          replace: true,
        });

        return;
      }

      setMedia([file], ["IMAGE"]);
    }

    /*
     * VIDEO
     */

    if (mode === "VIDEO") {
      if (!file.type.startsWith("video/")) {
        navigate("/posts/create", {
          replace: true,
        });

        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        navigate("/posts/create", {
          replace: true,
        });

        return;
      }

      setMedia([file], ["VIDEO"]);
    }

    /*
     * RETURN TO CREATE POST
     */

    navigate("/posts/create", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <input
        ref={inputRef}
        type="file"
        accept={mode === "PHOTO" ? "image/*" : "video/*"}
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
    </div>
  );
}
