"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationContext } from "utils/hooks/useNotificationContext";
import NotificationItem from "../notificationItem/notificationItem";
import styles from "./notificationIndicator.module.scss";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";

export default function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotificationContext();
  const router = useRouter();

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (id: number, link: string | null) => {
    markAsRead(id);

    setIsOpen(false);

    if (link) {
      router.push(link);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleSeeAllClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.indicator}>
      <div onClick={togglePanel}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className={styles.icon}
          style={{ fill: "currentColor" }}
        >
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
        <div className={clsx(styles.badge, unreadCount === 0 && styles.empty)}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
        <div
          className={clsx(
            styles.connectionStatus,
            isConnected ? styles.connected : styles.disconnected,
          )}
        />
      </div>

      <div ref={panelRef} className={clsx(styles.panel, isOpen && styles.open)}>
        <div className={styles.header}>
          <div className={styles.title}>notifications</div>
          <div className={styles.actions}>
            <button
              className={styles.action}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              mark all as read
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className={styles.empty}>no notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))
        )}
        <div className={styles.seeAll}>
          <Link href="/notifications" onClick={handleSeeAllClick}>
            see all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
