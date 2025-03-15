"use client";

import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
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
                  <Link
                    href={`/user/${user?.id}`}
                    className={clsx(
                      styles.noTextDecoration,
                      styles.userCardLink,
                      globals[`${textColorTheme}BackgroundColor`],
                    )}
                  >
                    <div className={styles.userCardInnerWrapper}>
                      <img
                        src={user.profilePicture}
                        alt={`${user.username}'s profile picture`}
                        className={styles.userCardProfilePicture}
                        onError={(e) => {
                          e.currentTarget.src = "/profilePicture.png";
                        }}
                      />
                      <div
                        className={clsx(
                          globals[`${theme}Color`],
                          styles.userCardTextWrapper,
                        )}
                        title={user.username}
                      >
                        <b className={styles.userCardText}>{user.username} </b>
                        <p className={styles.userCardText}>
                          {user.country &&
                            getUnicodeFlagIcon(
                              COUNTRY_NAMES_TO_CODES[user.country] ?? "ZZ",
                            )}
                        </p>
                        <p className={styles.userCardText}>{user.role}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
