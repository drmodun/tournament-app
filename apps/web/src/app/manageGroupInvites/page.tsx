"use server";

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
import ManageGroupInvites from "views/manageGroupInvites";

export default async function GroupInvites() {
  return (
    <div className={styles.wrapper}>
      <Navbar className={styles.navbar} />
      <div className={styles.screen}>
        <ManageGroupInvites />
      </div>
    </div>
  );
}
