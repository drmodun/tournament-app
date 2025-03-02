"use client";

import styles from "./manageGroupInvites.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useEffect, useRef, useState } from "react";
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
import { useGetUserGroupInvites } from "api/client/hooks/groupInvites/useGetUserGroupInvites";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useAcceptGroupInvite } from "api/client/hooks/groupInvites/useAcceptGroupInvite";
import { useDeclineGroupInvite } from "api/client/hooks/groupInvites/useDeclineGroupInvite";

export default function ManageGroupInvites() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data,
    isLoading,
    fetchNextPage,
    isFetchNextPageError,
    isFetching,
    hasNextPage,
  } = useGetUserGroupInvites();

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

  const acceptInviteMutation = useAcceptGroupInvite();
  const declineInviteMutation = useDeclineGroupInvite();

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>manage your group invites</h3>
      </div>

      <div className={styles.infiniteLoad}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
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
                {page.results.map((invite) => (
                  <div
                    key={invite.id}
                    className={clsx(
                      styles.inviteItem,
                      globals[`${textColorTheme}MutedBackgroundColor`],
                    )}
                  >
                    <h4 className={styles.title}>
                      {invite.name}{" "}
                      <span className={globals.label}>
                        ({invite.abbreviation})
                      </span>
                    </h4>
                    <p className={globals.label}>
                      country <b className={styles.info}> {invite.country}</b>
                    </p>
                    <p className={globals.label}>
                      location{" "}
                      <b className={styles.info}> {invite.location?.name}</b>
                    </p>
                    <p className={globals.label}>
                      type <b className={styles.info}> {invite.type}</b>
                    </p>
                    <div>
                      <p className={globals.label}>description</p>
                      <Markdown
                        className={clsx(
                          globals[`${textColorTheme}Color`],
                          globals[`${theme}BackgroundColor`],
                          styles.description,
                        )}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {invite.description}
                      </Markdown>
                    </div>
                    <div>
                      <p className={globals.label}>message</p>
                      <Markdown
                        className={clsx(
                          globals[`${textColorTheme}Color`],
                          globals[`${theme}BackgroundColor`],
                          styles.description,
                        )}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {invite.message}
                      </Markdown>
                    </div>
                    <div className={styles.actionButtons}>
                      <Button
                        variant="primary"
                        className={styles.actionButton}
                        label="accept"
                        onClick={() => acceptInviteMutation.mutate(invite.id)}
                      />
                      <Button
                        variant="danger"
                        className={styles.actionButton}
                        label="decline"
                        onClick={() => declineInviteMutation.mutate(invite.id)}
                      />
                    </div>
                  </div>
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
