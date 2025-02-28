"use client";

import styles from "./manageTeams.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import EditIcon from "@mui/icons-material/Edit";
import { groupRoleEnum, IGroupMembershipResponse } from "@tournament-app/types";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ManageTeamMembers from "views/manageTeamMembers";
import EditTeamForm from "views/editTeamForm";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import GroupJoinRequests from "views/groupJoinRequests";

type Item = {
  name: string;
  id: string;
};

export default function ManageTeams({
  team,
}: {
  team: IGroupMembershipResponse;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const editGroupMutation = useEditGroup(team?.groupId);

  const [lfpCampaigns, setLfpCampaigns] = useState<Item[]>([
    { name: "looking for CS:GO player this is a post!!!", id: "1" },
    {
      name: "this is another post where we look for Fortnite players",
      id: "2",
    },
    {
      name: "this is another post where we look for Fortnite players dosauihdsiauohdiuashdisa",
      id: "3",
    },
    { name: "looking for CS:GO player this is a post!!!", id: "4" },
    {
      name: "this is another post where we look for Fortnite players",
      id: "5",
    },
    {
      name: "this is another post where we look for Fortnite players dosdfhnucksdfnukhsdfhnuisauihdsiauohdiuashdisa",
      id: "6",
    },
    {
      name: "this is another post where we look for Fortnite players dosauihdsiauohdiuashdisa",
      id: "7",
    },
    { name: "looking for CS:GO player this is a post!!!", id: "8" },
  ]);

  const [addLfpModalActive, setAddLfpModalActive] = useState<boolean>(false);
  const [viewLfpModalActive, setViewLfpModalActive] = useState<boolean>(false);
  const [membersModalActive, setMembersModalActive] = useState<boolean>(false);
  const [groupJoinRequestsModal, setGroupJoinRequestsModal] =
    useState<boolean>(false);
  const [editTeamModalActive, setEditTeamModalActive] =
    useState<boolean>(false);

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
      />
      <Dialog
        active={viewLfpModalActive}
        onClose={() => setViewLfpModalActive(false)}
        variant={theme}
        className={styles.lfpViewDialogWrapper}
      >
        <ViewLFP />
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
          {(team?.role === groupRoleEnum.ADMIN ||
            team?.role === groupRoleEnum.OWNER) && (
            <Button
              label="edit"
              variant="secondary"
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
          )}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.lfpTopWrapper}>
          <b className={clsx(globals[`${theme}Color`])}>
            looking for players campains
          </b>
          <button className={styles.lfpButton}>
            <AddIcon className={styles[`${theme}Fill`]} />
          </button>
        </div>
        <div className={styles.campaignsWrapper}>
          <div className={styles.campaignsInnerWrapper}>
            <div className={styles.campaigns}>
              {lfpCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={clsx(
                    styles.campaign,
                    globals[`${theme}BackgroundColor`],
                    globals.paddingHorizontal,
                    globals.doublePaddingVertical,
                  )}
                >
                  <p
                    className={clsx(
                      styles.campaignTitle,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    {campaign.name}
                  </p>
                  <ArrowOutwardIcon
                    className={styles[`${textColorTheme}Fill`]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
