"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";
import { useAcceptGroupJoinRequest } from "api/client/hooks/groups/useAcceptGroupJoinRequest";
import { useGroupJoinRequests } from "api/client/hooks/groups/useGroupJoinRequests";
import { useRejectGroupJoinRequest } from "api/client/hooks/groups/useRejectGroupJoinRequest";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./groupJoinRequests.module.scss";

export default function GroupMembersDialog({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchNextPageError,
    isFetchPreviousPageError,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useGroupJoinRequests(groupId);
  const rejectJoinRequestMutation = useRejectGroupJoinRequest();
  const acceptJoinRequestMutation = useAcceptGroupJoinRequest();

  const [page, setPage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);

  const backward = async () => {
    if (page == 0) return;
    await fetchPreviousPage();

    setPage((curr) => curr - 1);
  };

  const forward = async () => {
    const nextPage = await fetchNextPage();

    if (
      isFetchNextPageError ||
      (nextPage.data?.pages[page + 1]?.results?.length ?? -1) == 0
    ) {
      setFetchLimit(page);
      return;
    }

    setPage((curr) => curr + 1);
  };

  const handleRemove = (id: number) => {
    rejectJoinRequestMutation.mutate({ groupId, userId: id });
  };

  const handleAccept = (id: number) => {
    acceptJoinRequestMutation.mutate({ groupId, userId: id });
  };

  return (
    <div className={clsx(styles.wrapper)}>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <>
          <p>
            <b className={globals[`${textColorTheme}Color`]}>
              group join requests
            </b>
          </p>
          <div className={styles.paginationContainer}>
            <button
              onClick={backward}
              disabled={
                page == 0 ||
                isFetching ||
                isFetchPreviousPageError ||
                isFetchingPreviousPage
              }
              className={styles.paginationButton}
            >
              <ArrowBackIcon
                className={clsx(globals[`${textColorTheme}FillChildren`])}
              />
            </button>
            <div className={styles.userCardWrapper}>
              {data?.pages[page]?.results.map((user) => (
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
                      src={user?.profilePicture}
                      alt={`${user?.username}'s profile picture`}
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
                      title={user?.username}
                    >
                      <b className={styles.userCardText}>{user?.username}</b>
                    </div>
                    <div className={styles.decisionButtonWrapper}>
                      <Button
                        onClick={() => handleAccept(user?.id)}
                        variant="primary"
                      >
                        <DoneIcon
                          className={clsx(
                            globals[`${textColorTheme}FillChildren`],
                            styles.decisionButtonContent,
                          )}
                        />
                      </Button>
                      <Button
                        onClick={() => handleRemove(user?.id)}
                        variant="danger"
                      >
                        <ClearIcon
                          className={clsx(
                            globals[`${textColorTheme}FillChildren`],
                            styles.decisionButtonContent,
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={forward}
              disabled={
                page == fetchLimit ||
                isFetching ||
                isFetchNextPageError ||
                isFetchingNextPage
              }
              className={styles.paginationButton}
            >
              <ArrowForwardIcon
                className={clsx(globals[`${textColorTheme}FillChildren`])}
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
