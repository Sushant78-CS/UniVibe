import { useLocation, useNavigate } from "react-router";
import FullScreenCamera from "./FullScreenCamera";
import { useCreatePostDraftStore } from "../../../store/createPostDraftStore";

export default function PostCameraPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const setMedia = useCreatePostDraftStore((state) => state.setMedia);

  const params = new URLSearchParams(location.search);

  const requestedMode = params.get("mode");

  const mode = requestedMode === "video" ? "VIDEO" : "PHOTO";

  const handleClose = () => {
    navigate("/posts/create");
  };

  const handlePhotoCaptured = (file: File) => {
    setMedia(file, "IMAGE");

    navigate("/posts/create", {
      replace: true,
    });
  };

  const handleVideoRecorded = (file: File) => {
    setMedia(file, "VIDEO");

    navigate("/posts/create", {
      replace: true,
    });
  };

  return (
    <FullScreenCamera
      mode={mode}
      onClose={handleClose}
      onPhotoCaptured={handlePhotoCaptured}
      onVideoRecorded={handleVideoRecorded}
    />
  );
}
