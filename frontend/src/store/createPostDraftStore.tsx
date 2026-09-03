import { create } from "zustand";
import type { PostCategory } from "../api/postApi";

interface CreatePostDraftState {
  description: string;
  category: PostCategory;

  selectedFile: File | null;
  mediaType: "IMAGE" | "VIDEO" | null;

  setDescription: (description: string) => void;
  setCategory: (category: PostCategory) => void;

  setMedia: (file: File | null, mediaType: "IMAGE" | "VIDEO" | null) => void;

  clearMedia: () => void;
  resetDraft: () => void;
}

const initialState = {
  description: "",
  category: "GENERAL" as PostCategory,
  selectedFile: null,
  mediaType: null as "IMAGE" | "VIDEO" | null,
};

export const useCreatePostDraftStore = create<CreatePostDraftState>((set) => ({
  ...initialState,

  setDescription: (description) => set({ description }),

  setCategory: (category) => set({ category }),

  setMedia: (selectedFile, mediaType) =>
    set({
      selectedFile,
      mediaType,
    }),

  clearMedia: () =>
    set({
      selectedFile: null,
      mediaType: null,
    }),

  resetDraft: () =>
    set({
      ...initialState,
    }),
}));
