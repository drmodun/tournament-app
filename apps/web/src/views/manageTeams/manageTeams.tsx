"use client";

import styles from "./manageTeams.module.scss";
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
  ILFPResponse,
} from "@tournament-app/types";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ManageTeamMembers from "views/manageTeamMembers";
import EditTeamForm from "views/editTeamForm";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import GroupJoinRequests from "views/groupJoinRequests";
import { useGetLFPs } from "api/client/hooks/lfp/useGetLFPs";
import Link from "next/link";
import EditLFPForm from "views/editLFPForm";
import DeleteIcon from "@mui/icons-material/Delete";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { deleteLFP, useDeleteLFP } from "api/client/hooks/lfp/useDeleteLFP";
import BrowseTeamLFG from "views/browseTeamLFG";

export default function ManageTeams({
  team,
}: {
  team: IGroupMembershipResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const editGroupMutation = useEditGroup(team?.groupId);

  const [addLfpModalActive, setAddLfpModalActive] = useState<boolean>(false);
  const [editLfpModalActive, setEditLfpModalActive] = useState<boolean>(false);
  const [activeLfp, setActiveLfp] = useState<ILFPResponse>();
  const [lfgModalActive, setLfgModalActive] = useState<boolean>(false);
  const [membersModalActive, setMembersModalActive] = useState<boolean>(false);
  const [groupJoinRequestsModal, setGroupJoinRequestsModal] =
    useState<boolean>(false);
  const [editTeamModalActive, setEditTeamModalActive] =
    useState<boolean>(false);
  const { data, isLoading } = useGetLFPs(team?.groupId);
  const deleteLFPMutation = useDeleteLFP();

  if (!team)
    return (
      <div>
        <p className={globals[`${textColorTheme}Color`]}>you have no teams!</p>
      </div>
    );

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <Dialog
        active={editTeamModalActive}
        onClose={() => setEditTeamModalActive(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <EditTeamForm mutation={editGroupMutation} groupId={team?.groupId} />
      </Dialog>
      <Dialog
        active={lfgModalActive}
        onClose={() => setLfgModalActive(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <BrowseTeamLFG groupId={team?.groupId} />
      </Dialog>
      <Dialog
        active={groupJoinRequestsModal}
        onClose={() => setGroupJoinRequestsModal(false)}
        variant={theme}
        className={styles.editTeamDialogWrapper}
      >
        <GroupJoinRequests groupId={team?.groupId} />
      </Dialog>
      <Dialog
        active={addLfpModalActive}
        onClose={() => setAddLfpModalActive(false)}
        variant={theme}
        className={styles.lfpDialogWrapper}
      >
        <AddLFPForm groupId={team?.groupId} />
      </Dialog>
      <Dialog
        active={editLfpModalActive}
        onClose={() => {
          setEditLfpModalActive(false);
          setActiveLfp(undefined);
        }}
        variant={theme}
        className={styles.lfpDialogWrapper}
      >
        <EditLFPForm lfp={activeLfp} />
      </Dialog>
      <Dialog
        active={membersModalActive}
        onClose={() => setMembersModalActive(false)}
        variant={theme}
        className={styles.membersDialogWrapper}
      >
        <ManageTeamMembers teamId={team?.groupId} />
      </Dialog>
      <div className={styles.left}>
        <div>
          <img
            src={team?.group?.logo}
            alt="team logo"
            className={styles.teamImage}
          />
          <p
            className={clsx(
              styles.teamName,
              globals[`${theme}Color`],
              styles.keepInLine,
            )}
          >
            <div>
              <b className={clsx(globals[`${theme}Color`], globals.largeText)}>
                {`${team?.group?.name} (${team?.group?.abbreviation})`}
              </b>{" "}
              {formatDate(new Date(team?.createdAt))}
            </div>
          </p>

          <div className={styles.property}>
            <p className={globals[`${theme}Color`]}>your role</p>
            <b className={globals[`${theme}Color`]}>{team?.role}</b>
          </div>
        </div>
        <div className={styles.leftButtons}>
          <Button
            label="members"
            variant={theme}
            className={styles.rostersButton}
            onClick={() => setMembersModalActive(true)}
          >
            <GroupIcon
              className={clsx(
                styles[`${textColorTheme}Fill`],
                styles.buttonIconPadding,
              )}
            />
          </Button>

          {(team?.role === groupRoleEnum.ADMIN ||
            team?.role === groupRoleEnum.OWNER) && (
            <>
              <Button
                label="edit"
                variant="warning"
                className={styles.rostersButton}
                onClick={() => setEditTeamModalActive(true)}
              >
                <EditIcon
                  className={clsx(
                    styles[`${textColorTheme}Fill`],
                    styles.buttonIconPadding,
                  )}
                />
              </Button>
              <Button
                label="group join requests"
                variant="primary"
                className={styles.rostersButton}
                onClick={() => setGroupJoinRequestsModal(true)}
              >
                <InboxIcon
                  className={clsx(
                    styles[`${textColorTheme}Fill`],
                    styles.buttonIconPadding,
                  )}
                />
              </Button>
              <Button
                label="browse candidates"
                variant="secondary"
                className={styles.rostersButton}
                onClick={() => setLfgModalActive(true)}
              >
                <TravelExploreIcon
                  className={clsx(
                    styles[`${textColorTheme}Fill`],
                    styles.buttonIconPadding,
                  )}
                />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.lfpTopWrapper}>
          <b className={clsx(globals[`${theme}Color`])}>
            looking for players campaigns
          </b>
          <button
            className={styles.lfpButton}
            onClick={() => setAddLfpModalActive(true)}
          >
            <AddIcon className={styles[`${theme}Fill`]} />
          </button>
        </div>
        <div className={styles.campaignsWrapper}>
          <div className={styles.campaignsInnerWrapper}>
            <div className={styles.campaigns}>
              {data && data?.length > 0 ? (
                data?.map((campaign) => (
                  <Link
                    key={campaign?.id}
                    className={clsx(
                      styles.campaign,
                      globals[`${theme}BackgroundColor`],
                      globals.paddingHorizontal,
                      globals.doublePaddingVertical,
                    )}
                    href={`/lfp/${campaign.id}/${campaign.groupId}`}
                  >
                    <p
                      className={clsx(
                        styles.campaignTitle,
                        globals[`${textColorTheme}Color`],
                      )}
                    >
                      {campaign.message}
                    </p>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.lfpDeleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteLFPMutation.mutate({
                            id: campaign?.id,
                            groupId: team.groupId,
                          });
                        }}
                        type="button"
                      >
                        <DeleteIcon
                          className={styles[`${textColorTheme}Fill`]}
                        />
                      </button>
                      <button
                        className={styles.lfpEditButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setActiveLfp(campaign);
                          setEditLfpModalActive(true);
                        }}
                        type="button"
                      >
                        <EditIcon className={styles[`${textColorTheme}Fill`]} />
                      </button>
                      <ArrowOutwardIcon
                        className={styles[`${textColorTheme}Fill`]}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <p className={globals[`${theme}Color`]}>no campaigns</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
