"use client";

import styles from "./manageRosters.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useEffect, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import EditIcon from "@mui/icons-material/Edit";
import {
  groupRoleEnum,
  IGroupMembershipResponse,
  ILFGResponse,
  IMiniGroupResponse,
} from "@tournament-app/types";
import {
  calculateBestPastDateFormat,
  COUNTRY_NAMES_TO_CODES,
  formatDate,
} from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ManageTeamMembers from "views/manageTeamMembers";
import EditTeamForm from "views/editTeamForm";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import GroupJoinRequests from "views/groupJoinRequests";
import { useGetLFPs } from "api/client/hooks/lfp/useGetLFPs";
import { useGetUserLFGs } from "api/client/hooks/lfg/useGetUserLFGs";
import ProgressWheel from "components/progressWheel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Chip from "components/chip";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteLFG } from "api/client/hooks/lfg/useDeleteLFG";
import AddLFGForm from "views/addLFGForm";
import EditLFGForm from "views/editLFGForm";
import { useGetGroupRosters } from "api/client/hooks/rosters/useGetGroupRosters";

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

  useEffect(() => {
    console.log("RPSTER GRUOP", group);
    console.log("ROSTER DATAAAA", data);
  }, [data]);

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
                              {e?.user.career?.map((career) => {
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
