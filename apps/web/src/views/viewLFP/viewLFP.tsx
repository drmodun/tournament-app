"use client";

import { use, useEffect, useState } from "react";
import styles from "./viewLFP.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { clsx } from "clsx";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import PersonIcon from "@mui/icons-material/Person";
import RichEditor from "components/richEditor";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  IGroupJoinRequestWithMiniUserResponse,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { useGroupJoinRequests } from "api/client/hooks/groups/useGroupJoinRequests";
import {
  calculateBestPastDateFormat,
  COUNTRY_NAMES_TO_CODES,
  formatDate,
} from "utils/mixins/formatting";
import { useGroupJoinRequestsLFP } from "api/client/hooks/groups/useGetGroupJoinRequestsLFP";
import { useGetLFPs } from "api/client/hooks/lfp/useGetLFPs";
import Chip from "components/chip";
import Link from "next/link";
import { useDeleteLFP } from "api/client/hooks/lfp/useDeleteLFP";

type Item = {
  name: string;
  id: string;
};

type Category = Item & {
  active: boolean;
};

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
    isLoading,
    isError,
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
