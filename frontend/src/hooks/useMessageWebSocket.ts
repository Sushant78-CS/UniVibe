import { useAuth } from "@clerk/react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../api/messageApi";

const API_URL = import.meta.env.VITE_API_URL;

interface UseMessageWebSocketProps {
  conversationId?: number;
  onMessage: (message: Message) => void;
}

export const useMessageWebSocket = ({
  conversationId,
  onMessage,
}: UseMessageWebSocketProps) => {
  const { getToken } = useAuth();

  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  const [connected, setConnected] = useState(false);

  const connect = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    const token = await getToken();

    if (!token) {
      console.error("Unable to get Clerk token.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        return new SockJS(`${API_URL}/ws`);
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      debug: (message) => {
        console.log("[STOMP]", message);
      },

      onConnect: () => {
        console.log(`WebSocket connected to conversation ${conversationId}`);

        setConnected(true);

        subscriptionRef.current = client.subscribe(
          `/topic/conversations/${conversationId}`,
          (message: IMessage) => {
            try {
              const receivedMessage: Message = JSON.parse(message.body);

              onMessage(receivedMessage);
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          },
        );
      },

      onDisconnect: () => {
        console.log("WebSocket disconnected.");
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);

        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
      },
    });

    clientRef.current = client;

    client.activate();
  }, [conversationId, getToken, onMessage]);

  const disconnect = useCallback(() => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setConnected(false);
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const client = clientRef.current;

      if (!client || !client.connected) {
        throw new Error("WebSocket is not connected.");
      }

      client.publish({
        destination: `/app/messages/${conversationId}`,
        body: JSON.stringify({
          content,
        }),
      });
    },
    [conversationId],
  );

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return {
    connected,
    sendMessage,
    disconnect,
  };
};
