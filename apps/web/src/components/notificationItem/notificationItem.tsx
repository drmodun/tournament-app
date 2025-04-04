"use client";

import { useCallback } from "react";
import { INotificationResponse } from "api/client/hooks/notifications/types";
import styles from "./notificationItem.module.scss";
import Image from "next/image";
import { useNotificationContext } from "utils/hooks/useNotificationContext";
import { clsx } from "clsx";

interface NotificationItemProps {
  notification: INotificationResponse;
  onClick: (id: number, link: string | null) => void;
}

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationContext();
  const { notification: item, isRead } = notification;

  const handleClick = () => {
    onClick(item.id, item.link);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(item.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(item.id);
  };

  const getDefaultIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={styles.icon}
      >
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
      </svg>
    );
  };

  const renderImage = useCallback(() => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt="Notification"
          width={40}
          height={40}
          className={styles.image}
        />
      );
    }

    return <div className={styles.image}>{getDefaultIcon()}</div>;
  }, [item.image]);

  // Format date without using date-fns
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsAgo < 60) {
      return "just now";
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
      return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) {
      return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <div
      className={clsx(styles.item, !isRead && styles.unread)}
      onClick={handleClick}
    >
      {renderImage()}
      <div className={styles.content}>
        <div className={styles.message}>{item.message}</div>
        <div className={styles.time}>{formatDate(item.createdAt)}</div>
        {!isRead && (
          <div className={styles.actions}>
            <button className={styles.action} onClick={handleMarkAsRead}>
              Mark as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
