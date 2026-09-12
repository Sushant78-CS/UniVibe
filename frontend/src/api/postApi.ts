import api from "./axios";

export type PostCategory =
  | "EVENT"
  | "NEWS"
  | "ANNOUNCEMENT"
  | "ACHIEVEMENT"
  | "GENERAL";

export type MediaType = "IMAGE" | "VIDEO";

export interface PostMedia {
  mediaUrl: string;
  mediaType: MediaType;
  displayOrder: number;
}

export interface Post {
  id: number;
  userId: number;
  profileId: number | null;

  fullName: string | null;
  username: string | null;
  profileImage: string | null;

  description: string;
  category: PostCategory;

  media: PostMedia[];

  createdAt: string;
  updatedAt: string | null;

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

  isOwner?: boolean;
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

export interface CreatePostMediaData {
  mediaUrl: string;
  mediaType: MediaType;
  displayOrder: number;
}

export interface CreatePostData {
  description: string;
  category: PostCategory;
  media: CreatePostMediaData[];
}

export const usePostApi = () => {
  // =========================================================
  // GET POSTS
  // =========================================================

  const getPosts = async (page = 0, size = 10): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>("/posts", {
      params: {
        page,
        size,
      },
    });

    return response.data;
  };

  // =========================================================
  // GET MY POSTS
  // =========================================================

  const getMyPosts = async (
    page = 0,
    size = 10,
  ): Promise<PageResponse<Post>> => {
    const response = await api.get<PageResponse<Post>>("/posts/mine", {
      params: {
        page,
        size,
      },
    });

    return response.data;
  };

  // =========================================================
  // CREATE POST
  // =========================================================

  const createPost = async (data: CreatePostData): Promise<Post> => {
    const response = await api.post<Post>("/posts", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  };

  // =========================================================
  // UPDATE POST
  // =========================================================

  const updatePost = async (
    postId: number,
    data: CreatePostData,
    removeMedia = false,
  ): Promise<Post> => {
    const response = await api.put<Post>(
      `/posts/${postId}`,
      {
        description: data.description,
        category: data.category,
        media: data.media,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          removeMedia,
        },
      },
    );

    return response.data;
  };

  // =========================================================
  // DELETE POST
  // =========================================================

  const deletePost = async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  };

  // =========================================================
  // LIKE POST
  // =========================================================

  const likePost = async (postId: number): Promise<void> => {
    await api.post(`/posts/${postId}/like`, null);
  };

  // =========================================================
  // UNLIKE POST
  // =========================================================

  const unlikePost = async (postId: number): Promise<void> => {
    await api.delete(`/posts/${postId}/like`);
  };

  // =========================================================
  // GET COMMENTS
  // =========================================================

  const getComments = async (postId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/posts/${postId}/comments`);

    return response.data;
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const addComment = async (
    postId: number,
    content: string,
  ): Promise<Comment> => {
    const response = await api.post<Comment>(`/posts/${postId}/comments`, {
      content,
    });

    return response.data;
  };

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  const deleteComment = async (commentId: number): Promise<void> => {
    await api.delete(`/posts/comments/${commentId}`);
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
