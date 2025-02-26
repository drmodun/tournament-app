"use client";

import styles from "./groupCompetitions.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import { useGetGroupTournaments } from "api/client/hooks/groups/useGetGroupTournaments";

export default function GroupMembersDialog({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetGroupTournaments(groupId);

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>competitions</b>
      </p>
      <div className={styles.userCardWrapper}>
        {data?.results.length == 0 ? (
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
