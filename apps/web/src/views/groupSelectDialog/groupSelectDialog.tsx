"use client";

import styles from "./groupSelectDialog.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ProgressWheel from "components/progressWheel";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";
import { useAdminUserGroups } from "api/client/hooks/groups/useAdminUserGroups";
import { useCreatorUserGroups } from "api/client/hooks/groups/useCreatorUserGroups";

export default function GroupSelectDialog({
  competitionId,
}: {
  competitionId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [adminPage, setAdminPage] = useState<number>(0);
  const [creatorPage, setCreatorPage] = useState<number>(0);
  const [adminFetchLimit, setAdminFetchLimit] = useState<number>(-1);
  const [creatorFetchLimit, setCreatorFetchLimit] = useState<number>(-1);
  const [selectedGroup, setSelectedGroup] = useState<number>(-1);

  const {
    data: adminData,
    isLoading: adminIsLoading,
    fetchNextPage: adminFetchNextPage,
    isFetchingNextPage: adminIsFetchingNextPage,
    isFetchingPreviousPage: adminIsFetchingPreviousPage,
    isFetchNextPageError: adminIsFetchNextPageError,
    isFetchPreviousPageError: adminIsFetchPreviousPageError,
    fetchPreviousPage: adminFetchPreviousPage,
  } = useAdminUserGroups();

  const forward = async () => {
    let nextPage;

    nextPage = await adminFetchNextPage();

    if (
      adminIsFetchNextPageError ||
      (nextPage.data?.pages[adminPage + 1]?.results?.length ?? -1) == 0
    ) {
      setAdminFetchLimit(adminPage);
      return;
    }

    setAdminPage((curr) => curr + 1);
  };

  const backward = async () => {
    if (adminPage == 0) return;
    await adminFetchPreviousPage();

    setAdminPage((curr) => curr - 1);
  };

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>
          groups you administrate
        </b>
      </p>
      {adminIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.groupsWrapper}>
          <ArrowBackIcon
            onClick={() =>
              !adminIsFetchPreviousPageError &&
              !adminIsFetchingPreviousPage &&
              adminPage != 0 &&
              backward()
            }
            className={clsx(
              styles.arrow,
              adminPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
          <div>
            {adminData?.pages[adminPage]?.results?.map((group) => {
              console.log(group);
              return (
                <div
                  onClick={() => setSelectedGroup(group?.groupId)}
                  className={clsx(
                    group.groupId === selectedGroup
                      ? [globals.primaryBackgroundColor, globals.lightColor]
                      : [
                          globals[`${textColorTheme}BackgroundColor`],
                          globals[`${theme}Color`],
                        ],
                    styles.groupInfoWrapper,
                  )}
                >
                  <img
                    src={group?.group?.logo}
                    alt="group logo"
                    onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
                    className={styles.groupLogo}
                  />
                  <div
                    className={clsx(
                      styles.inherit,
                      styles.groupInfoTextWrapper,
                    )}
                  >
                    <p className={styles.inherit}>{group?.group?.name}</p>
                    <p className={globals.inherit}>
                      {group?.group?.abbreviation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <ArrowForwardIcon
            onClick={() =>
              !adminIsFetchNextPageError &&
              !adminIsFetchingNextPage &&
              adminPage != adminFetchLimit &&
              forward()
            }
            className={clsx(
              styles.arrow,
              adminPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
        </div>
      )}
    </div>
  );
}
