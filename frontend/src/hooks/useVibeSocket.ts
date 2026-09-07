import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { VibeMessage } from "../api/vibeApi";

interface UseVibeSocketOptions {
  token: string | null;
  onMessage: (message: VibeMessage) => void;
  onDelete?: (messageId: number) => void;
}

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

export const useVibeSocket = ({
  token,
  onMessage,
  onDelete,
}: UseVibeSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  const [connected, setConnected] = useState(false);

  /*
   * Keep callbacks in refs so changing the callback functions
   * does not cause the WebSocket connection to reconnect.
   */
  const onMessageRef = useRef(onMessage);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  const disconnect = useCallback(async () => {
    const client = clientRef.current;

    if (!client) {
      setConnected(false);
      return;
    }

    try {
      /*
       * Tell the backend that this user is leaving Vibe.
       */
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

      await client.deactivate();
    } catch (error) {
      console.error("Failed to disconnect Vibe WebSocket:", error);
    } finally {
      if (clientRef.current === client) {
        clientRef.current = null;
      }

      setConnected(false);
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) {
      console.log("Vibe WebSocket: waiting for token...");
      return;
    }

    /*
     * Don't create another client if one is already active.
     */
    if (clientRef.current?.active) {
      return;
    }

    /*
     * Clean up an old inactive client if one exists.
     */
    if (clientRef.current) {
      clientRef.current = null;
    }

    console.log("Vibe WebSocket: connecting to", `${API_URL}/ws`);

    const client = new Client({
      webSocketFactory: () => {
        console.log("Vibe WebSocket: creating SockJS connection");

        return new SockJS(`${API_URL}/ws`);
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      /*
       * Reconnect automatically if the connection drops.
       */
      reconnectDelay: 5000,

      /*
       * Heartbeat helps detect dead connections.
       */
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      /*
       * Enable temporarily while debugging.
       */
      debug: (message) => {
        console.log("[STOMP]", message);
      },

      onConnect: (frame) => {
        console.log("Vibe WebSocket CONNECTED", frame.headers);

        setConnected(true);

        /*
         * Subscribe to new/edit messages.
         */
        client.subscribe("/topic/vibe", (message: IMessage) => {
          try {
            console.log("Vibe WebSocket MESSAGE RECEIVED:", message.body);

            const vibeMessage = JSON.parse(message.body) as VibeMessage;

            if (!vibeMessage?.id) {
              console.warn("Received invalid Vibe message:", vibeMessage);
              return;
            }

            onMessageRef.current(vibeMessage);
          } catch (error) {
            console.error("Failed to parse Vibe message:", error, message.body);
          }
        });

        /*
         * Subscribe to deleted messages.
         */
        client.subscribe("/topic/vibe-delete", (message: IMessage) => {
          try {
            console.log("Vibe WebSocket DELETE RECEIVED:", message.body);

            const parsed = JSON.parse(message.body);

            const messageId =
              typeof parsed === "number" ? parsed : Number(parsed);

            if (!Number.isFinite(messageId)) {
              console.warn("Invalid deleted Vibe message ID:", message.body);
              return;
            }

            onDeleteRef.current?.(messageId);
          } catch (error) {
            console.error(
              "Failed to parse deleted Vibe message:",
              error,
              message.body,
            );
          }
        });

        /*
         * Tell backend that this user entered Vibe.
         */
        try {
          client.publish({
            destination: "/app/vibe/enter",
            body: "",
          });

          console.log("Vibe enter event sent");
        } catch (error) {
          console.error("Failed to send Vibe enter event:", error);
        }
      },

      onDisconnect: () => {
        console.log("Vibe WebSocket DISCONNECTED");

        setConnected(false);
      },

      onStompError: (frame) => {
        console.error(
          "Vibe STOMP ERROR:",
          frame.headers["message"],
          frame.body,
        );

        setConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("Vibe WebSocket CONNECTION ERROR:", error);

        setConnected(false);
      },

      onWebSocketClose: (event) => {
        console.warn("Vibe WebSocket CLOSED:", event.code, event.reason);

        setConnected(false);
      },
    });

    clientRef.current = client;

    client.activate();
  }, [token]);

  /*
   * Connect when token becomes available.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    connect();

    return () => {
      void disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    connected,
    reconnect: connect,
    disconnect,
  };
};
