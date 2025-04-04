"use client";

import { IMatchupsWithMiniRostersResponse } from "@tournament-app/types";
import { useGetUserManagedMatchups } from "api/client/hooks/matchups/useGetUserManagedMatchups";
import Dialog from "components/dialog";
import { useEffect, useRef, useState } from "react";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./manageUserManagedMatchups.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { formatDateTime } from "utils/mixins/formatting";
import Chip from "components/chip";
import Button from "components/button";

export default function ManagedUserManagedMatchups() {
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, fetchNextPage, isFetching, hasNextPage, isFetchNextPageError } =
    useGetUserManagedMatchups();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
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
    <div className={styles.wrapper}>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      ></Dialog>
      <div
        className={clsx(
          styles.contentWrapper,
          globals[`${textColorTheme}BackgroundColor`],
        )}
      >
        {data &&
          data.pages.map((page) => {
            return page.flatMap((elem: IMatchupsWithMiniRostersResponse) => {
              console.log(elem, "elem");
              return (
                <div
                  key={elem.id}
                  className={clsx(
                    styles.matchupCard,
                    globals[`${theme}BackgroundColor`],
                  )}
                >
                  <div className={styles.matchupWrapper}>
                    {elem.rosters.map((roster, index) => {
                      return (
                        <>
                          <div
                            key={roster.id}
                            className={clsx(styles.rosterWrapper)}
                          >
                            <h3>
                              {roster?.participation?.group?.name ??
                                roster?.participation?.user?.username}
                            </h3>
                            {roster.players.map((player) => {
                              return (
                                <div
                                  key={player?.user?.id}
                                  className={styles.playerWrapper}
                                >
                                  <p>{player.user?.username}</p>
                                </div>
                              );
                            })}
                          </div>
                          {index % 2 == 0 &&
                            elem.rosters.length > index + 1 && (
                              <p
                                className={clsx(
                                  globals[`${textColorTheme}Color`],
                                  styles.versus,
                                )}
                              >
                                vs
                              </p>
                            )}
                        </>
                      );
                    })}
                  </div>
                  <div className={styles.details}>
                    {elem.startDate && (
                      <Chip
                        variant="secondary"
                        label={formatDateTime(new Date(elem.startDate))}
                      />
                    )}
                    {elem.isFinished && (
                      <Chip
                        variant="primary"
                        label={elem.isFinished ? "finished" : "in progress"}
                      />
                    )}
                    {elem.matchupType && (
                      <Chip
                        variant="primary"
                        label={
                          elem.matchupType === "ONE_VS_ONE"
                            ? "1v1"
                            : "free for all"
                        }
                      />
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Button
                      onClick={() => {
                        setDialogActive(true);
                      }}
                      variant="warning"
                      style={{ color: "white" }}
                      className={styles.submitButton}
                    >
                      manage matchup
                    </Button>
                  </div>
                </div>
              );
            });
          })}
      </div>
    </div>
  );
}
