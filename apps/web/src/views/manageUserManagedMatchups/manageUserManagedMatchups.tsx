"use client";

import { useGetUserManagedMatchups } from "api/client/hooks/matchups/useGetUserManagedMatchups";
import Dialog from "components/dialog";
import { useEffect, useState } from "react";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./manageUserManagedMatchups.module.scss";

export default function ManagedUserManagedMatchups() {
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, fetchNextPage } = useGetUserManagedMatchups();

  return (
    <div className={styles.wrapper}>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      ></Dialog>
      {data &&
        data.pages.map((page) => {
          return page.flatMap((elem) => {
            console.log(elem, "elem");
            return <div></div>;
          });
        })}
    </div>
  );
}
