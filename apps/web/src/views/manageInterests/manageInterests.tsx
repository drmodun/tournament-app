"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteUserInterest } from "api/client/hooks/interests/useDeleteUserInterest";
import {
  Interest,
  useGetPaginatedUserInterests,
} from "api/client/hooks/interests/useGetPaginatedUserInterests";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { IBaseQueryResponse } from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddInterestsForm from "views/addInterestsForm";
import styles from "./manageInterests.module.scss";
import { useDeleteGroupInterest } from "api/client/hooks/interests/useDeleteGroupInterest";
import { useInfiniteScrollTrigger } from "utils/hooks/useInfiniteScrollTrigger";

export default function ManageInterests() {
  return (
    <InterestsManager
      query={useGetPaginatedUserInterests()}
      title="manage your interests"
    />
  );
}

/** Interest list with infinite scroll and an add dialog, for a user or a group. */
export function InterestsManager({
  query,
  title,
  group = false,
  groupId,
  className,
}: {
  query: UseInfiniteQueryResult<InfiniteData<IBaseQueryResponse<Interest>>>;
  title: string;
  group?: boolean;
  groupId?: number;
  className?: string;
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
  } = query;

  const loadMoreRef = useInfiniteScrollTrigger({
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
  });

  const [addInterestsDialogOpen, setAddInterestsDialogOpen] =
    useState<boolean>(false);

  return (
    <div
      className={clsx(
        styles.wrapper,
        className,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <Dialog
        active={addInterestsDialogOpen}
        onClose={() => setAddInterestsDialogOpen(false)}
        variant={theme}
      >
        <AddInterestsForm
          group={group}
          groupId={groupId}
          onClose={() => setAddInterestsDialogOpen(false)}
          userInterestIds={data?.pages.flatMap((page) => {
            return page.results.flatMap((interest: Interest) => interest.id);
          })}
        />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>{title}</h3>
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
                    interest={interest}
                    variant={theme}
                    deletable={true}
                    group={group}
                    groupId={groupId}
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
            ],
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
          styles.bio,
        )}
        rehypePlugins={[rehypeRaw]}
      >
        {interest?.description}
      </Markdown>
    </div>
  );
}
