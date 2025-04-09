"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteUserInterest } from "api/client/hooks/interests/useDeleteUserInterest";
import {
  Interest,
  useGetPaginatedUserInterests,
} from "api/client/hooks/interests/useGetPaginatedUserInterests";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddInterestsForm from "views/addInterestsForm";
import styles from "./manageInterests.module.scss";
import { useDeleteGroupInterest } from "api/client/hooks/interests/useDeleteGroupInterest";
import { UseMutationResult } from "@tanstack/react-query";
import { useCreateUserInterests } from "api/client/hooks/interests/useCreateUserInterests";

export default function ManageInterests() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isFetchNextPageError,
  } = useGetPaginatedUserInterests();

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
      { threshold: 0.1 }
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
        globals[`${theme}Color`]
      )}
    >
      <Dialog
        active={addInterestsDialogOpen}
        onClose={() => setAddInterestsDialogOpen(false)}
        variant={theme}
      >
        <AddInterestsForm
          onClose={() => setAddInterestsDialogOpen(false)}
          userInterestIds={data?.pages.flatMap((page) => {
            return page.results.flatMap((interest: Interest) => interest.id);
          })}
        />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>manage your interests</h3>
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
                  styles[`${theme}Color`]
                )}
              >
                {page.results.map((interest) => (
                  <InterestCard
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

export function InterestCard({
  interest,
  variant = "light",
  selected = false,
  className,
  deletable = false,
  group = false,
  groupId,
}: {
  interest?: Partial<Interest>;
  variant?: TextVariants;
  selected?: boolean;
  className?: string;
  deletable?: boolean;
  group?: boolean;
  groupId?: number;
}) {
  const deleteMutation = group
    ? useDeleteGroupInterest(groupId)
    : useDeleteUserInterest();

  return (
    <div
      className={clsx(
        className,
        styles.interestCard,
        selected
          ? [globals.primaryBackgroundColor, globals.lightColor]
          : [
              globals[`${variant}BackgroundColor`],
              globals[`${textColor(variant)}Color`],
            ]
      )}
    >
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <img
            src={interest?.image ?? "/noimg.jpg"}
            onError={(e) => {
              e.currentTarget.src = "/noimg.jpg";
            }}
            className={styles.interestLogo}
          />
          <div className={styles.topText}>
            <p className={clsx(styles.interestName)}>{interest?.name}</p>
            <Chip
              label={interest?.type}
              variant={selected ? "light" : textColor(variant)}
              className={styles.interestType}
            />
          </div>
        </div>
        <div>
          {deletable && (
            <Button
              variant="danger"
              onClick={() =>
                deleteMutation && deleteMutation.mutate(interest?.id)
              }
            >
              <DeleteIcon
                className={clsx(globals.lightFillChildren, styles.deleteIcon)}
              />
            </Button>
          )}
        </div>
      </div>
      <Markdown
        className={clsx(
          globals[`${selected ? "light" : textColor(variant)}Color`],
          styles.bio
        )}
        rehypePlugins={[rehypeRaw]}
      >
        {interest?.description}
      </Markdown>
    </div>
  );
}
