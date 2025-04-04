"use client";

import { useGetGroupInterests } from "api/client/hooks/interests/useGetGroupInterests";
import { Interest } from "api/client/hooks/interests/useGetPaginatedUserInterests";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useEffect, useRef, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddGroupInterestsForm from "views/addGroupInterestsForm";
import { InterestCard } from "views/manageInterests/manageInterests";
import styles from "./manageGroupInterests.module.scss";

export default function ManageGroupInterests({
  groupId,
}: {
  groupId?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isFetchNextPageError,
  } = useGetGroupInterests(groupId);

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

  const [addInterestsDialogOpen, setAddInterestsDialogOpen] =
    useState<boolean>(false);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <Dialog
        active={addInterestsDialogOpen}
        onClose={() => setAddInterestsDialogOpen(false)}
        variant={theme}
      >
        <AddGroupInterestsForm
          onClose={() => setAddInterestsDialogOpen(false)}
          userInterestIds={data?.pages.flatMap((page) => {
            return page.results.flatMap((interest: Interest) => interest.id);
          })}
          groupId={groupId}
        />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>
          manage the group's interests
        </h3>
        <Button
          label="add interests"
          variant="primary"
          onClick={() => setAddInterestsDialogOpen(true)}
        />
      </div>

      <div className={styles.currentInterests}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : data?.pages[0].results.length === 0 ? (
          <div className={styles.noInvites}>
            <p className={globals[`${theme}Color`]}>you have no invites!</p>
          </div>
        ) : (
          <>
            {data?.pages.map((page, i) => (
              <div
                key={i}
                className={clsx(
                  styles.invitesContainer,
                  styles[`${theme}Color`],
                )}
              >
                {page.results.map((interest) => (
                  <InterestCard
                    group={true}
                    groupId={groupId}
                    interest={interest}
                    variant={theme}
                    deletable={true}
                  />
                ))}
              </div>
            ))}
            <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
              {isFetching && hasNextPage && (
                <ProgressWheel variant={textColorTheme} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
