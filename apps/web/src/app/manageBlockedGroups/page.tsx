"use client";

import { useAuth } from "api/client/hooks/auth/useAuth";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import ManageBlockedGroups from "views/manageBlockedGroups/manageBlockedGroups";
import Navbar from "views/navbar";
import styles from "./index.module.scss";

export default function BlockedGroups() {
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
            <ManageBlockedGroups />
          )}
        </div>
      </div>
    </div>
  );
}
