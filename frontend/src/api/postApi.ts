import { useAuth } from "@clerk/react";
import api from "./axios";

export type PostCategory =
  | "EVENT"
  | "NEWS"
  | "ANNOUNCEMENT"
  | "ACHIEVEMENT"
  | "GENERAL";

export interface Post {
  id: number;
  userId: number;
  profileId: number | null;

  fullName: string | null;
  username: string | null;
  profileImage?: string | null;

  description: string;
  category: PostCategory;

  imageUrl?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
}

export interface Comment {
  id: number;
  userId: number;
  fullName: string | null;
  username: string | null;
  profileImage?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreatePostData {
  description: string;
  category: PostCategory;
}

export const usePostApi = () => {
  const { getToken } = useAuth();

  const getPosts = async (page = 0, size = 10): Promise<PageResponse<Post>> => {
    const token = await getToken();

    const response = await api.get<PageResponse<Post>>("/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        size,
      },
    });

    return response.data;
  };

  const getMyPosts = async (
    page = 0,
    size = 10,
  ): Promise<PageResponse<Post>> => {
    const token = await getToken();

    const response = await api.get<PageResponse<Post>>("/posts/mine", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        size,
      },
    });

    return response.data;
  };

  const createPost = async (
    data: CreatePostData,
    image?: File | null,
  ): Promise<Post> => {
    const token = await getToken();

    const formData = new FormData();

    formData.append(
      "post",
      new Blob(
        [
          JSON.stringify({
            description: data.description,
            category: data.category,
          }),
        ],
        {
          type: "application/json",
        },
      ),
    );

    if (image) {
      formData.append("image", image);
    }

    const response = await api.post<Post>("/posts", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const updatePost = async (
    postId: number,
    data: CreatePostData,
    image?: File | null,
    removeImage: boolean = false,
  ): Promise<Post> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const formData = new FormData();

    // Post JSON
    const postBlob = new Blob(
      [
        JSON.stringify({
          description: data.description,
          category: data.category,
        }),
      ],
      {
        type: "application/json",
      },
    );

    formData.append("post", postBlob);

    // New image
    if (image) {
      formData.append("image", image);
    }

    // Remove image
    const removeImageBlob = new Blob([JSON.stringify(removeImage)], {
      type: "application/json",
    });

    formData.append("removeImage", removeImageBlob);

    const response = await api.put<Post>(`/posts/${postId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const deletePost = async (id: number) => {
    const token = await getToken();

    await api.delete(`/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const likePost = async (postId: number): Promise<void> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    await api.post(`/posts/${postId}/like`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const unlikePost = async (postId: number): Promise<void> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    await api.delete(`/posts/${postId}/like`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const getComments = async (postId: number): Promise<Comment[]> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await api.get<Comment[]>(`/posts/${postId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const addComment = async (
    postId: number,
    content: string,
  ): Promise<Comment> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await api.post<Comment>(
      `/posts/${postId}/comments`,
      {
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

  const deleteComment = async (commentId: number): Promise<void> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    await api.delete(`/posts/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return {
    getPosts,
    getMyPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getComments,
    addComment,
    deleteComment,
  };
};
