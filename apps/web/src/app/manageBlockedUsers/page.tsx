"use client";

import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import ManageCompetitions from "views/manageCompetitions";
import Navbar from "views/navbar";
import styles from "./index.module.scss";
import { useGetBlockedGroups } from "api/client/hooks/blockedGroups/useGetBlockedGroups";
import { useGetBlockedUsers } from "api/client/hooks/blockedUsers/useGetBlockedUsers";
import ManageBlockedUsers from "views/manageBlockedUsers";

export default function BlockedUsers() {
  const { data, isLoading, isError } = useAuth();
  const { theme } = useThemeContext();
  const router = useRouter();

  useEffect(() => {
    if (isError) router.push("/");
  }, [isError]);

  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div>
        <div className={clsx(styles.screen)}>
          {isLoading || isError ? (
            <ProgressWheel variant={textColor(theme)} />
          ) : (
            <ManageBlockedUsers />
          )}
        </div>
      </div>
    </div>
  );
}
