"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { useGetBlockedGroups } from "api/client/hooks/blockedGroups/useGetBlockedGroups";
import { useGetUserOrganizedCompetitions } from "api/client/hooks/competitions/useGetUserOrganizedCompetitions";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { useEffect, useRef } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./manageBlockedGroups.module.scss";
import { useDeleteBlockedGroup } from "api/client/hooks/blockedGroups/useDeleteBlockedGroup";

export default function ManageBlockedGroups() {
  const { theme } = useThemeContext();

  const {
    data: blockedUsers,
    isFetching,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
  } = useGetBlockedGroups();

  const textColorTheme = textColor(theme);
  const { isLoading, data } = useGetUserOrganizedCompetitions();

  const deleteBlockedGroupMutation = useDeleteBlockedGroup();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!data || !hasNextPage || isFetching || isFetchNextPageError) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !isFetching &&
          !isFetchNextPageError &&
          hasNextPage
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isFetching, isFetchNextPageError, fetchNextPage, hasNextPage]);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${theme}Color`], styles.title)}>
          your blocked users
        </b>
      </div>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.blockedUsersWrapper}>
          <div className={styles.blockedUsers}>
            {(blockedUsers?.pages[0].results.length ?? -1) <= 0 ? (
              <div>
                <p className={globals[`${theme}Color`]}>
                  you have no blocked groups!
                </p>
              </div>
            ) : (
              blockedUsers?.pages.map((page) =>
                page?.results.map((card, index) => {
                  return (
                    <div
                      className={clsx(
                        styles.userCard,
                        globals[`${textColorTheme}Color`],
                        globals[`${theme}BackgroundColor`],
                      )}
                      key={index}
                    >
                      <div className={styles.leftContent}>
                        <img
                          src={card.logo ?? "/profilePicture.png"}
                          onError={(e) => {
                            e.currentTarget.src = "/profilePicture.png";
                          }}
                          className={styles.pfp}
                        />
                        <p>{card.name}</p>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() =>
                          deleteBlockedGroupMutation.mutate(card.id)
                        }
                      >
                        <DeleteIcon
                          className={clsx(
                            globals.lightFillChildren,
                            styles.trashButton,
                          )}
                        />
                      </Button>
                    </div>
                  );
                }),
              )
            )}
          </div>
          <div ref={loadMoreRef} className={styles.loadMore}>
            {isFetching && <ProgressWheel variant={textColorTheme} />}
          </div>
        </div>
      )}
    </div>
  );
}
