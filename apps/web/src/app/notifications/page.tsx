"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNotificationContext } from "utils/hooks/useNotificationContext";
import NotificationItem from "components/notificationItem";
import { useAuth } from "api/client/hooks/auth/useAuth";
import ProgressWheel from "components/progressWheel";
import { useRedirect } from "utils/hooks/useRedirect";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { TextVariants, Variants } from "types/styleTypes";
import { notificationTypeEnum } from "@tournament-app/types";
import styles from "./notifications.module.scss";
import globals from "styles/globals.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import { useGetNotificationsInfinite } from "api/client/hooks/notifications/useGetNotificationsInfinite";

type FilterCategory = {
  label: string;
  types: notificationTypeEnum[];
  key: string;
};

export default function NotificationsPage() {
  const { markAllAsRead, markAsRead } = useNotificationContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(
    undefined,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const { theme } = useThemeContext();
  const { isSuccess, isLoading: authLoading } = useAuth();
  const { redirectToLogin } = useRedirect();

  const colorTheme: Variants = theme;
  const textColorTheme: TextVariants =
    colorTheme === "light" ? "dark" : "light";

  const filterCategories: FilterCategory[] = useMemo(
    () => [
      {
        label: "All",
        types: [] as notificationTypeEnum[],
        key: "all",
      },
      {
        label: "Account",
        types: [
          notificationTypeEnum.WELCOME,
          notificationTypeEnum.RESET_PASSWORD,
          notificationTypeEnum.VERIFY_EMAIL,
          notificationTypeEnum.NOTIFICATION_OF_BAN,
        ],
        key: "account",
      },
      {
        label: "Tournaments",
        types: [
          notificationTypeEnum.TOURNAMENT_REMINDER,
          notificationTypeEnum.TOURNAMENT_START,
          notificationTypeEnum.TOURNAMENT_END,
          notificationTypeEnum.BET_OUTCOME,
        ],
        key: "tournaments",
      },
      {
        label: "Groups",
        types: [
          notificationTypeEnum.GROUP_INVITATION,
          notificationTypeEnum.GROUP_JOIN_REQUEST,
          notificationTypeEnum.GROUP_JOIN_APPROVAL,
          notificationTypeEnum.GROUP_JOIN_REJECTION,
          notificationTypeEnum.GROUP_REMOVAL,
          notificationTypeEnum.GROUP_ADMIN_PROMOTION,
          notificationTypeEnum.GROUP_ADMIN_DEMOTION,
        ],
        key: "groups",
      },
      {
        label: "Social",
        types: [
          notificationTypeEnum.NEW_FOLLOWER,
          notificationTypeEnum.GROUP_INVITATION,
        ],
        key: "social",
      },
    ],
    [],
  );

  const selectedType = useMemo(() => {
    if (selectedCategory === "all" || !selectedCategory) {
      return undefined;
    }

    const category = filterCategories.find(
      (cat) => cat.key === selectedCategory,
    );
    if (category && category.types.length === 1) {
      return category.types[0];
    }

    console.log(category?.types);

    return category?.types;
  }, [selectedCategory, filterCategories]);

  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: notificationsLoading,
  } = useGetNotificationsInfinite({
    types: selectedType as notificationTypeEnum[],
    isRead: isReadFilter,
  });

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    return notificationsData.pages.flatMap((page) => page);
  }, [notificationsData]);

  useEffect(() => {
    if (!authLoading && !isSuccess) {
      redirectToLogin();
    }
  }, [authLoading, isSuccess, redirectToLogin]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleNotificationClick = useCallback(
    (id: number, link: string | null) => {
      markAsRead(id);

      if (link) {
        window.location.href = link;
      }
    },
    [markAsRead],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category === selectedCategory ? null : category);
    },
    [selectedCategory],
  );

  const handleReadFilterChange = useCallback(
    (filter: boolean | undefined) => {
      console.log(filter, isReadFilter);
      setIsReadFilter(filter == isReadFilter ? undefined : filter);
    },
    [isReadFilter],
  );

  if (authLoading) {
    return (
      <div
        className={clsx(
          globals[`${colorTheme}BackgroundColor`],
          styles.loadingContainer,
        )}
      >
        <ProgressWheel variant={colorTheme} />
      </div>
    );
  }

  return (
    <div
      className={clsx(globals[`${colorTheme}BackgroundColor`], styles.screen)}
    >
      <Navbar className={styles.navbar} variant={textColorTheme} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={clsx(styles.title, globals[`${textColorTheme}Color`])}>
            Notifications
          </h1>
          {notifications && notifications.length > 0 && (
            <Button
              label="Mark all as read"
              variant={textColorTheme}
              onClick={markAllAsRead}
            />
          )}
        </div>

        <div
          className={clsx(
            styles.filterSection,
            globals[`${colorTheme}BackgroundColor`],
            globals.boxShadow,
          )}
        >
          <div
            className={clsx(
              styles.filterLabel,
              globals[`${textColorTheme}Color`],
            )}
          >
            Filter by type:
          </div>
          <div className={styles.chipGroup}>
            {filterCategories.map((category) => (
              <button
                key={category.key}
                className={clsx(
                  styles.chip,
                  selectedCategory === category.key && styles.active,
                )}
                onClick={() => handleCategoryChange(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div
            className={clsx(
              styles.filterLabel,
              globals[`${textColorTheme}Color`],
            )}
          >
            Filter by status:
          </div>
          <div className={styles.statusChips}>
            <button
              className={clsx(
                styles.chip,
                isReadFilter === false && styles.active,
              )}
              onClick={() => handleReadFilterChange(false)}
            >
              Unread
            </button>
            <button
              className={clsx(
                styles.chip,
                isReadFilter === true && styles.active,
              )}
              onClick={() => handleReadFilterChange(true)}
            >
              Read
            </button>
          </div>
        </div>

        {notificationsLoading && notifications.length === 0 ? (
          <div className={styles.loadingContainer}>
            <ProgressWheel variant={colorTheme} />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <>
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <div
                  key={notification.notification.id}
                  className={clsx(
                    styles.notificationCard,
                    globals[`${colorTheme}BackgroundColor`],
                    globals.boxShadow,
                  )}
                >
                  <NotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                </div>
              ))}
              <div ref={bottomRef} style={{ height: "20px", width: "100%" }} />
            </div>

            {isFetchingNextPage && (
              <div className={styles.loadMoreContainer}>
                <ProgressWheel variant={colorTheme} />
              </div>
            )}

            {!hasNextPage && notifications.length > 10 && (
              <div
                className={clsx(
                  styles.emptyState,
                  globals[`${textColorTheme}Color`],
                )}
              >
                <p>No more notifications</p>
              </div>
            )}
          </>
        ) : (
          <div
            className={clsx(
              styles.emptyState,
              globals[`${textColorTheme}Color`],
            )}
          >
            <p>You have no notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
