"use client";

import styles from "./index.module.scss";
import Navbar from "views/navbar";
import { clsx } from "clsx";
import ManageCompetitions from "views/manageCompetitions";
import { useAuth } from "api/client/hooks/auth/useAuth";
import ProgressWheel from "components/progressWheel";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Competitions() {
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
            <ManageCompetitions user={data!} />
          )}
        </div>
      </div>
    </div>
  );
}
