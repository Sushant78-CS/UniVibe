import api from "./axios";

export type VibeMediaType = "IMAGE" | "GIF" | "PDF";

export interface VibeMessage {
  id: number;
  content: string | null;
  mediaUrl: string | null;
  mediaType: VibeMediaType | null;
  createdAt: string;
  mine?: boolean;
}

export interface CreateVibeMessageRequest {
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: VibeMediaType | null;
}

export const getVibeMessages = async (
  token: string,
  limit = 50,
): Promise<VibeMessage[]> => {
  const response = await api.get<VibeMessage[]>("/vibe/messages", {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const sendVibeMessage = async (
  token: string,
  request: CreateVibeMessageRequest,
): Promise<VibeMessage> => {
  const response = await api.post<VibeMessage>("/vibe/messages", request, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
