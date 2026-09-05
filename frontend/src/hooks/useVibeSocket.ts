import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { VibeMessage } from "../api/vibe";

interface UseVibeSocketOptions {
  token: string | null;
  onMessage: (message: VibeMessage) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const useVibeSocket = ({ token, onMessage }: UseVibeSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  const [connected, setConnected] = useState(false);

  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!token) {
      return;
    }

    if (clientRef.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      debug: () => {
        // Keep disabled in production.
      },

      onConnect: () => {
        setConnected(true);

        client.subscribe("/topic/vibe", (message: IMessage) => {
          try {
            const vibeMessage = JSON.parse(message.body) as VibeMessage;

            onMessageRef.current(vibeMessage);
          } catch (error) {
            console.error("Failed to parse Vibe message:", error);
          }
        });

        client.publish({
          destination: "/app/vibe/enter",
          body: "",
        });
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("Vibe WebSocket error:", frame.headers["message"]);

        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("Vibe WebSocket connection error:", error);

        setConnected(false);
      },
    });

    clientRef.current = client;

    client.activate();
  }, [token]);

  const disconnect = useCallback(() => {
    const client = clientRef.current;

    if (!client) {
      return;
    }

    if (client.connected) {
      try {
        client.publish({
          destination: "/app/vibe/leave",
          body: "",
        });
      } catch (error) {
        console.error("Failed to send Vibe leave event:", error);
      }
    }

    client.deactivate();

    clientRef.current = null;

    setConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    reconnect: connect,
    disconnect,
  };
};
