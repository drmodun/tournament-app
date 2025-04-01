"use client";

import React, { useEffect } from "react";
import { useNotificationContext } from "utils/hooks/useNotificationContext";
import NotificationItem from "components/notificationItem";
import { useAuth } from "api/client/hooks/auth/useAuth";
import ProgressWheel from "components/progressWheel";
import { useRedirect } from "utils/hooks/useRedirect";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { TextVariants, Variants } from "types/styleTypes";
import styles from "./notifications.module.scss";

export default function NotificationsPage() {
  const {
    notifications,
    markAllAsRead,
    isLoading: notificationsLoading,
    fetchNotifications,
  } = useNotificationContext();
  const { theme } = useThemeContext();
  const { data, isSuccess, isLoading: authLoading } = useAuth();
  const { redirectToLogin } = useRedirect();

  const colorTheme: Variants = theme;
  const textColorTheme: TextVariants =
    colorTheme === "light" ? "dark" : "light";

  useEffect(() => {
    if (isSuccess && data?.id) {
      fetchNotifications();
    }
  }, [isSuccess, data?.id, fetchNotifications]);

  useEffect(() => {
    if (!authLoading && !isSuccess) {
      redirectToLogin();
    }
  }, [authLoading, isSuccess, redirectToLogin]);

  const handleNotificationClick = (id: number, link: string | null) => {
    if (link) {
      window.location.href = link;
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <ProgressWheel variant={colorTheme} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        {notifications && notifications.length > 0 && (
          <Button
            label="Mark all as read"
            variant={textColorTheme}
            onClick={markAllAsRead}
          />
        )}
      </div>

      {notificationsLoading ? (
        <div className={styles.loadingContainer}>
          <ProgressWheel variant={colorTheme} />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className={styles.notificationsList}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>You have no notifications</p>
        </div>
      )}
    </div>
  );
}
