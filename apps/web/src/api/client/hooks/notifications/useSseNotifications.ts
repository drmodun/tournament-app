"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { baseApiUrl } from "api/client/base";
import { INotificationBase } from "./types";
import { useToastContext } from "utils/hooks/useToastContext";

export const useSseNotifications = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const toast = useToastContext();

  const handleNotification = useCallback(
    (event: MessageEvent) => {
      try {
        const eventData: INotificationBase = JSON.parse(event.data);
        const notification = eventData;

        toast.addToast(notification.message, "info");

        const notificationEvent = new CustomEvent("new-notification", {
          detail: notification,
        });
        window.dispatchEvent(notificationEvent);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    },
    [toast]
  );

  const connect = useCallback(() => {
    if (!token) return;

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `${baseApiUrl}/notifications/stream?token=${token}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log("SSE connection established");
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);

        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          connect();
        }, 5000);
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
