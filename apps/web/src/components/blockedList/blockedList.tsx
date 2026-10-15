"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { ReactNode, Ref } from "react";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import styles from "./blockedList.module.scss";

export type BlockedItem = {
  id: number;
  name: string;
  image?: string;
};

/** Card list of blocked users or groups, each with a remove button. */
export default function BlockedList({
  title,
  header,
  emptyText,
  items,
  isLoading,
  isFetching,
  loadMoreRef,
  onRemove,
  variant,
}: {
  title: string;
  /** Extra controls next to the title, e.g. a group picker. */
  header?: ReactNode;
  emptyText: string;
  items?: BlockedItem[];
  isLoading: boolean;
  isFetching: boolean;
  loadMoreRef: Ref<HTMLDivElement>;
  onRemove: (id: number) => void;
  variant: TextVariants;
}) {
  const textColorTheme = textColor(variant);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <div className={styles.competitionsTitle}>
        <b className={clsx(globals[`${variant}Color`], styles.title)}>
          {title}
        </b>
        {header}
      </div>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.blockedUsersWrapper}>
          <div className={styles.blockedUsers}>
            {(items?.length ?? -1) <= 0 ? (
              <div>
                <p className={globals[`${variant}Color`]}>{emptyText}</p>
              </div>
            ) : (
              items?.map((card, index) => (
                <div
                  className={clsx(
                    styles.userCard,
                    globals[`${textColorTheme}Color`],
                    globals[`${variant}BackgroundColor`],
                  )}
                  key={index}
                >
                  <div className={styles.leftContent}>
                    <img
                      src={card.image ?? "/profilePicture.png"}
                      onError={(e) => {
                        e.currentTarget.src = "/profilePicture.png";
                      }}
                      className={styles.pfp}
                    />
                    <p>{card.name}</p>
                  </div>
                  <Button variant="danger" onClick={() => onRemove(card.id)}>
                    <DeleteIcon
                      className={clsx(
                        globals.lightFillChildren,
                        styles.trashButton,
                      )}
                    />
                  </Button>
                </div>
              ))
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
