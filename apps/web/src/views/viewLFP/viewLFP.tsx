"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { IGroupJoinRequestWithMiniUserResponse } from "@tournament-app/types";
import { useGroupJoinRequestsLFP } from "api/client/hooks/groups/useGetGroupJoinRequestsLFP";
import { useDeleteLFP } from "api/client/hooks/lfp/useDeleteLFP";
import { clsx } from "clsx";
import Button from "components/button";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./viewLFP.module.scss";

export default function ViewLFP({
  lfpID,
  groupID,
}: {
  lfpID: number;
  groupID?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [page, setPage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);
  const deletionMutation = useDeleteLFP();

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    isFetching,
    isFetchNextPageError,
    isFetchPreviousPageError,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useGroupJoinRequestsLFP({
    relatedLFPId: lfpID,
  });

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

  return (
    <div className={styles.wrapper}>
      <h3 className={globals[`${textColorTheme}Color`]}>
        LFP join requests for ID {lfpID}
      </h3>
      <div
        className={clsx(
          styles.pagination,
          globals[`${textColorTheme}BackgroundColor`],
        )}
      >
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
          <ArrowBackIcon className={clsx(globals[`${theme}FillChildren`])} />
        </button>
        <div className={styles.cards}>
          {data?.pages[page].results.length == 0 ? (
            <p className={globals[`${theme}Color`]}>
              there are no join requests!
            </p>
          ) : (
            data?.pages[page].results.map(
              (item: IGroupJoinRequestWithMiniUserResponse) => (
                <Link
                  key={item.id}
                  className={clsx(
                    globals[`${theme}BackgroundColor`],
                    styles.card,
                  )}
                  href={`/user/${item.id}`}
                >
                  <div className={styles.text}>
                    <div className={styles.textTop}>
                      <img
                        src={item.profilePicture}
                        alt="profile picture"
                        onError={(e) =>
                          (e.currentTarget.src = "/profilePicture.png")
                        }
                        className={styles.pfp}
                      />
                      <p>
                        <b className={globals[`${textColorTheme}Color`]}>
                          {item.username}
                        </b>
                      </p>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="primary"
                      label="accept"
                      className={styles.actionButton}
                    />
                    <Button
                      variant="danger"
                      label="reject"
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deletionMutation.mutate({
                          id: item.id,
                          groupId: groupID,
                        });
                      }}
                    />
                  </div>
                </Link>
              ),
            )
          )}
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
          <ArrowForwardIcon className={clsx(globals[`${theme}FillChildren`])} />
        </button>
      </div>
    </div>
  );
}
