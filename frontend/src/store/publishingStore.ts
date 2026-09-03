import { create } from "zustand";

export type PublishingStatus =
  | "IDLE"
  | "COMPRESSING"
  | "UPLOADING"
  | "CREATING"
  | "SUCCESS"
  | "ERROR";

interface PublishingState {
  status: PublishingStatus;
  progress: number;
  message: string;
  error: string | null;

  completedAt: number | null;

  startCompressing: () => void;
  startUploading: () => void;
  setUploadProgress: (progress: number) => void;
  startCreating: () => void;

  success: () => void;
  fail: (error: string) => void;
  reset: () => void;
}

export const usePublishingStore = create<PublishingState>((set) => ({
  status: "IDLE",
  progress: 0,
  message: "",
  error: null,

  completedAt: null,

  startCompressing: () =>
    set({
      status: "COMPRESSING",
      progress: 0,
      message: "Optimizing media...",
      error: null,
      completedAt: null,
    }),

  startUploading: () =>
    set({
      status: "UPLOADING",
      progress: 0,
      message: "Uploading media...",
      error: null,
    }),

  setUploadProgress: (progress) =>
    set({
      progress: Math.min(100, Math.max(0, progress)),
      message: `Uploading media... ${Math.round(progress)}%`,
    }),

  startCreating: () =>
    set({
      status: "CREATING",
      progress: 100,
      message: "Creating your post...",
      error: null,
    }),

  success: () =>
    set({
      status: "SUCCESS",
      progress: 100,
      message: "Post published successfully!",
      error: null,
      completedAt: Date.now(),
    }),

  fail: (error) =>
    set({
      status: "ERROR",
      message: "Publishing failed",
      error,
    }),

  reset: () =>
    set({
      status: "IDLE",
      progress: 0,
      message: "",
      error: null,
      completedAt: null,
    }),
}));
