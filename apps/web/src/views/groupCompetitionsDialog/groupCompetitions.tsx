"use client";

import { useGetGroupTournaments } from "api/client/hooks/groups/useGetGroupTournaments";
import { clsx } from "clsx";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
import styles from "./groupCompetitions.module.scss";

export default function GroupMembersDialog({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data } = useGetGroupTournaments(groupId);

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>competitions</b>
      </p>
      <div className={styles.userCardWrapper}>
        {data?.results?.length == 0 ? (
          <p className={globals[`${textColorTheme}Color`]}>
            no competitions found!
          </p>
        ) : (
          data?.results.map((comp) => {
            return (
              <Link
                href={`/contest/${comp.id}`}
                className={clsx(
                  styles.noTextDecoration,
                  styles.userCardLink,
                  globals[`${textColorTheme}BackgroundColor`],
                )}
              >
                <div className={styles.userCardInnerWrapper}>
                  <img
                    src={comp.logo}
                    alt={`${comp.logo}'s logo`}
                    className={styles.userCardProfilePicture}
                    onError={(e) => {
                      e.currentTarget.src = "/noimg.jpg";
                    }}
                  />
                  <div
                    className={clsx(
                      globals[`${theme}Color`],
                      styles.userCardTextWrapper,
                    )}
                    title={comp.name}
                  >
                    <b className={styles.userCardText}>{comp.name} </b>
                    <p className={styles.userCardText}>
                      {comp.country &&
                        getUnicodeFlagIcon(
                          COUNTRY_NAMES_TO_CODES[comp.country] ?? "ZZ",
                        )}
                    </p>
                    <p className={styles.userCardText}>{comp.type}</p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
