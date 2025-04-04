"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import InboxIcon from "@mui/icons-material/Inbox";
import LogoutIcon from "@mui/icons-material/Logout";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  groupRoleEnum,
  IGroupMembershipResponse,
  ILFPResponse,
} from "@tournament-app/types";
import { useDeleteGroup } from "api/client/hooks/groups/useDeleteGroup";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import { useLeaveUserGroup } from "api/client/hooks/groups/useLeaveUserGroup";
import { useDeleteLFP } from "api/client/hooks/lfp/useDeleteLFP";
import { useGetGroupLFPs } from "api/client/hooks/lfp/useGetGroupLFPs";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import Link from "next/link";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import BrowseTeamLFG from "views/browseTeamLFG";
import EditLFPForm from "views/editLFPForm";
import EditTeamForm from "views/editTeamForm";
import GroupJoinRequests from "views/groupJoinRequests";
import ManageTeamMembers from "views/manageTeamMembers";
import styles from "./manageTeams.module.scss";

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
  const { data } = useGetGroupLFPs(team?.groupId);
  const deleteLFPMutation = useDeleteLFP();

  const deleteGroupMutation = useDeleteGroup();
  const leaveGroupMutation = useLeaveUserGroup();

  const deleteGroup = async () => {
    await deleteGroupMutation.mutateAsync(team?.groupId);
  };

  const leaveGroup = async () => {
    await leaveGroupMutation.mutateAsync(team?.groupId);
  };

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
        <AddLFPForm
          groupId={team?.groupId}
          onClose={() => setAddLfpModalActive(false)}
        />
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
        <EditLFPForm
          lfp={activeLfp}
          onClose={() => setEditLfpModalActive(false)}
        />
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
            className={styles.teamImage}
            onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
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
                globals[`${textColorTheme}FillChildren`],
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
                    globals.darkFillChildren,
                    styles.buttonIconPadding,
                  )}
                />
              </Button>
              <div className={styles.splitButtons}>
                <Button
                  label="group join requests"
                  variant="primary"
                  className={styles.rostersButton}
                  onClick={() => setGroupJoinRequestsModal(true)}
                >
                  <InboxIcon
                    className={clsx(
                      globals.darkFillChildren,
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
                      globals.darkFillChildren,
                      styles.buttonIconPadding,
                    )}
                  />
                </Button>
              </div>
            </>
          )}

          <div className={styles.splitButtons}>
            <Button
              label="leave group"
              variant="danger"
              className={styles.rostersButton}
              onClick={leaveGroup}
            >
              <LogoutIcon
                className={clsx(
                  globals.darkFillChildren,
                  styles.buttonIconPadding,
                )}
              />
            </Button>
            {(team?.role === groupRoleEnum.ADMIN ||
              team?.role === groupRoleEnum.OWNER) && (
              <Button
                label="delete group"
                variant="danger"
                className={styles.rostersButton}
                onClick={deleteGroup}
              >
                <DeleteIcon
                  className={clsx(
                    globals.darkFillChildren,
                    styles.buttonIconPadding,
                  )}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div
          className={clsx(
            styles.lfpTopWrapper,
            team?.role !== groupRoleEnum.ADMIN &&
              team?.role !== groupRoleEnum.OWNER &&
              styles.verticalPadding,
          )}
        >
          <b className={clsx(globals[`${theme}Color`])}>
            looking for players campaigns
          </b>
          <button
            className={clsx(
              styles.lfpButton,
              team?.role !== groupRoleEnum.ADMIN &&
                team?.role !== groupRoleEnum.OWNER &&
                globals.hidden,
            )}
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
                    href={
                      team?.role !== groupRoleEnum.ADMIN &&
                      team?.role !== groupRoleEnum.OWNER
                        ? "#"
                        : `/lfp/${campaign.id}/${campaign.groupId}`
                    }
                  >
                    <p
                      className={clsx(
                        styles.campaignTitle,
                        globals[`${textColorTheme}Color`],
                      )}
                    >
                      {campaign.message}
                    </p>
                    <div
                      className={clsx(
                        styles.actionButtons,
                        team?.role !== groupRoleEnum.ADMIN &&
                          team?.role !== groupRoleEnum.OWNER &&
                          globals.hidden,
                      )}
                    >
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
                        <DeleteIcon className={globals.darkFillChildren} />
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
                        <EditIcon className={globals.darkFillChildren} />
                      </button>
                      <ArrowOutwardIcon className={globals.darkFillChildren} />
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
