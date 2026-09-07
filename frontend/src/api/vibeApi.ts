import api from "./axios";

export type VibeMediaType = "IMAGE" | "GIF" | "STICKER" | "PDF";

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

// =========================================================
// GET VIBE MESSAGES
// =========================================================

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

// =========================================================
// SEND VIBE MESSAGE
// =========================================================

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

// =========================================================
// EDIT VIBE MESSAGE
// =========================================================

export const editVibeMessage = async (
  token: string,
  messageId: number,
  content: string,
): Promise<VibeMessage> => {
  const response = await api.put<VibeMessage>(
    `/vibe/messages/${messageId}`,
    {
      content,
      mediaUrl: null,
      mediaType: null,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// =========================================================
// DELETE VIBE MESSAGE
// =========================================================

export const deleteVibeMessage = async (
  token: string,
  messageId: number,
): Promise<void> => {
  await api.delete(`/vibe/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
