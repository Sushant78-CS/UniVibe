import { create } from "zustand";
import type { PostCategory, MediaType } from "../api/postApi";

interface CreatePostDraftState {
  description: string;
  category: PostCategory;

  selectedFiles: File[];
  mediaTypes: MediaType[];

  setDescription: (description: string) => void;

  setCategory: (category: PostCategory) => void;

  setMedia: (files: File[], mediaTypes: MediaType[]) => void;

  clearMedia: () => void;

  resetDraft: () => void;
}

const initialState = {
  description: "",
  category: "GENERAL" as PostCategory,

  selectedFiles: [] as File[],
  mediaTypes: [] as MediaType[],
};

export const useCreatePostDraftStore = create<CreatePostDraftState>((set) => ({
  ...initialState,

  setDescription: (description) =>
    set({
      description,
    }),

  setCategory: (category) =>
    set({
      category,
    }),

  setMedia: (files, mediaTypes) =>
    set({
      selectedFiles: files,
      mediaTypes,
    }),

  clearMedia: () =>
    set({
      selectedFiles: [],
      mediaTypes: [],
    }),

  resetDraft: () =>
    set({
      ...initialState,
    }),
}));
