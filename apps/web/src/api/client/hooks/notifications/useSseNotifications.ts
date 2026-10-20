"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { baseApiUrl } from "api/client/base";
import { INotificationBase } from "./types";
import { useToastContext } from "utils/hooks/useToastContext";

// Stream tokens are short-lived, so after a dropped connection a fresh one is requested through
// onConnectionLost; the new token then reconnects the stream.
export const useSseNotifications = (
  token: string | null,
  onConnectionLost: () => void,
) => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  // Kept in a ref so a new callback identity does not reopen the stream
  const onConnectionLostRef = useRef(onConnectionLost);
  onConnectionLostRef.current = onConnectionLost;
  const toast = useToastContext();

  const handleNotification = useCallback(
    (event: MessageEvent) => {
      try {
        const eventData: INotificationBase = JSON.parse(event.data);
        const notification = eventData;

        toast.addToast(notification.message, "info", "/notifications");

        const notificationEvent = new CustomEvent("new-notification", {
          detail: notification,
        });
        window.dispatchEvent(notificationEvent);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    },
    [toast],
  );

  const connect = useCallback(() => {
    if (!token) return;

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `${baseApiUrl}/notifications/stream?token=${token}`,
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log("SSE connection established");
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        setTimeout(() => onConnectionLostRef.current(), 5000);
      };

      eventSource.addEventListener("notification", handleNotification);
    } catch (error) {
      console.error("Error connecting to SSE:", error);
      setIsConnected(false);
    }
  }, [token, handleNotification]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return { isConnected };
};
