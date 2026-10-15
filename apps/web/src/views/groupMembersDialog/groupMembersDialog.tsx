"use client";

import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import LinkCard from "components/linkCard";
import styles from "./groupMembersDialog.module.scss";

export default function GroupMembersDialog({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetGroupMembers(groupId);

  return (
    <div className={clsx(styles.wrapper)}>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <>
          <p>
            <b className={globals[`${textColorTheme}Color`]}>members</b>
          </p>
          <div>
            <div className={styles.userCardWrapper}>
              {data?.members?.map((user) => {
                return (
                  <LinkCard
                    key={user?.id}
                    href={`/user/${user?.id}`}
                    image={user.profilePicture}
                    fallbackImage="/profilePicture.png"
                    name={user.username}
                    country={user.country}
                    detail={user.role ?? ""}
                    variant={theme}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
