"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetUserFollowers } from "api/client/hooks/followers/useGetUserFollowers";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
import styles from "./userFollowers.module.scss";

export default function UserFollowersDialog() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetching,
    isFetchNextPageError,
    isFetchPreviousPageError,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useGetUserFollowers();
  const [page, setPage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);

  const forward = async () => {
    const nextPage = await fetchNextPage();

    if (
      isFetchNextPageError ||
      (nextPage.data?.pages[page + 1]?.results?.length ?? 0) == 0
    ) {
      setFetchLimit(page);
      return;
    }

    setPage((curr) => curr + 1);
  };

  const backward = async () => {
    if (page === 0) return;

    await fetchPreviousPage();

    setPage((curr) => curr - 1);
  };

  return (
    <div className={clsx(styles.wrapper)}>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <>
          <p>
            <b className={globals[`${textColorTheme}Color`]}>followers</b>
          </p>
          {data?.pages[0]?.results.length === 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>
              you have no followers.
            </p>
          ) : (
            <div className={styles.userCardContainer}>
              <button
                disabled={
                  isFetching ||
                  page === 0 ||
                  isFetchPreviousPageError ||
                  isFetchingPreviousPage
                }
                onClick={backward}
                className={styles.arrowButton}
              >
                <ArrowBackIcon
                  className={clsx(globals[`${textColorTheme}FillChildren`])}
                />
              </button>
              <div className={styles.userCardWrapper}>
                {data?.pages[page]?.results?.length == 0 ? (
                  <p className={globals[`${textColorTheme}Color`]}>
                    you have no followers
                  </p>
                ) : (
                  data?.pages[page].results?.map((user) => {
                    return (
                      <Link
                        href={`/user/${user?.id}`}
                        className={clsx(
                          styles.noTextDecoration,
                          styles.userCardLink,
                          globals[`${textColorTheme}BackgroundColor`]
                        )}
                      >
                        <div className={styles.userCardInnerWrapper}>
                          <img
                            src={user.profilePicture ?? "/profilePicture.png"}
                            className={styles.userCardProfilePicture}
                            onError={(e) => {
                              e.currentTarget.src = "/profilePicture.png";
                            }}
                          />
                          <div
                            className={clsx(
                              globals[`${theme}Color`],
                              styles.userCardTextWrapper
                            )}
                            title={user.username}
                          >
                            <b className={styles.userCardText}>
                              {user.username}{" "}
                            </b>
                            <p className={styles.userCardText}>
                              {user.country &&
                                getUnicodeFlagIcon(
                                  COUNTRY_NAMES_TO_CODES[user.country] ?? "ZZ"
                                )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
              <button
                disabled={
                  isFetching ||
                  isFetchNextPageError ||
                  isFetchingNextPage ||
                  fetchLimit === page
                }
                onClick={forward}
                className={styles.arrowButton}
              >
                <ArrowForwardIcon
                  className={clsx(globals[`${textColorTheme}FillChildren`])}
                />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
