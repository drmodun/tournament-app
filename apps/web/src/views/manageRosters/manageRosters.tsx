"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import InboxIcon from "@mui/icons-material/Inbox";
import { IGroupMembershipResponse } from "@tournament-app/types";
import { useGetGroupRosters } from "api/client/hooks/rosters/useGetGroupRosters";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import ProgressWheel from "components/progressWheel";
import { useEffect } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { calculateBestPastDateFormat } from "utils/mixins/formatting";
import styles from "./manageRosters.module.scss";

export default function ManageRosters({
  group,
}: {
  group?: IGroupMembershipResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useGetGroupRosters(group?.groupId);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      {/*
      <Dialog
        active={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <AddLFGForm />
      </Dialog>
      <Dialog
        active={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <EditLFGForm lfg={active} />
      </Dialog>
      */}
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>
          {group?.group?.name}'s rosters
        </h3>
        <button
          className={styles.addButton}
          //onClick={() => setAddDialogOpen(true)}
        >
          <AddIcon className={styles[`${theme}Fill`]} />
        </button>
      </div>
      <div className={styles.infiniteLoad}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <ProgressWheel />
          </div>
        ) : data?.pages.length === 0 ||
          data?.pages[0]?.results?.length === 0 ? (
          <div className={styles.emptyState}>
            <InboxIcon className={styles.emptyIcon} />
            <p className={globals[`${theme}Color`]}>
              No rosters have been created yet
            </p>
          </div>
        ) : (
          <>
            {data?.pages.map((page, pageIndex) => (
              <div key={pageIndex} className={styles.rostersContainer}>
                {page.results.map((roster) => (
                  <div key={roster?.id} className={styles.rosterItem}>
                    <Chip
                      label={`roster id ${roster?.id}`}
                      variant={theme}
                      className={styles.rosterName}
                    />
                    <div className={styles.rosterInfo}>
                      <div
                        className={clsx(
                          globals[`${theme}Color`],
                          styles.cardWrapper,
                        )}
                      >
                        {roster?.players.map((e) => (
                          <div
                            className={clsx(
                              styles.card,
                              globals[`${theme}BackgroundColor`],
                              globals[`${textColorTheme}Color`],
                            )}
                          >
                            <div className={styles.cardTop}>
                              <img
                                src={e.user.profilePicture}
                                alt="profile picture"
                                className={styles.profilePicture}
                                onError={(e) =>
                                  (e.currentTarget.src = "/profilePicture.png")
                                }
                              />
                              <p className={styles.username}>
                                {e?.user?.username}
                              </p>
                            </div>
                            <div className={styles.careers}>
                              {e?.career?.map((career) => {
                                console.log(career);
                                return (
                                  <Chip
                                    className={styles.chip}
                                    variant={textColorTheme}
                                    label={career.category.name}
                                  >
                                    <p className={globals[`${theme}Color`]}>
                                      {career.elo}
                                    </p>
                                  </Chip>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className={styles.rosterDescription}>
                        {roster?.participationId}
                      </p>
                      <div className={styles.rosterMeta}>
                        <span>
                          Created:{" "}
                          {calculateBestPastDateFormat(roster?.createdAt)}
                        </span>
                        <span>stage_id: {roster?.stageId}</span>
                      </div>
                    </div>
                    <div className={styles.rosterActions}>
                      <Button variant="warning">
                        <EditIcon /> Edit
                      </Button>
                      <Button variant="secondary">
                        <GroupIcon /> Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {
              <div className={styles.loadMoreContainer}>
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage || isFetchNextPageError}
                  variant="secondary"
                >
                  {isFetchingNextPage ? (
                    <ProgressWheel />
                  ) : (
                    <>
                      Load more <ArrowForwardIcon fontSize="small" />
                    </>
                  )}
                </Button>
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
}
