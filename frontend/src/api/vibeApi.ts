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

export const getVibeMessages = async (limit = 50): Promise<VibeMessage[]> => {
  const response = await api.get<VibeMessage[]>("/vibe/messages", {
    params: { limit },
  });

  return response.data;
};

// =========================================================
// SEND VIBE MESSAGE
// =========================================================

export const sendVibeMessage = async (
  request: CreateVibeMessageRequest,
): Promise<VibeMessage> => {
  const response = await api.post<VibeMessage>("/vibe/messages", request);

  return response.data;
};

// =========================================================
// EDIT VIBE MESSAGE
// =========================================================

export const editVibeMessage = async (
  messageId: number,
  content: string,
): Promise<VibeMessage> => {
  const response = await api.put<VibeMessage>(`/vibe/messages/${messageId}`, {
    content,
    mediaUrl: null,
    mediaType: null,
  });

  return response.data;
};

// =========================================================
// DELETE VIBE MESSAGE
// =========================================================

export const deleteVibeMessage = async (messageId: number): Promise<void> => {
  await api.delete(`/vibe/messages/${messageId}`);
};

// =========================================================
// CHECK VIBE MEMBERSHIP
// =========================================================

export const checkVibeMembership = async (): Promise<boolean> => {
  const response = await api.get<boolean>("/vibe/membership");

  return response.data;
};

// =========================================================
// JOIN VIBE
// =========================================================

export const joinVibe = async (): Promise<void> => {
  await api.post("/vibe/join");
};

// =========================================================
// LEAVE VIBE
// =========================================================

export const leaveVibe = async (): Promise<void> => {
  await api.delete("/vibe/leave");
};
