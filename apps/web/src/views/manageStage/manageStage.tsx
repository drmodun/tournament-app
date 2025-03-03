"use client";

import styles from "./manageStage.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import { useGetUserGroupInvites } from "api/client/hooks/groupInvites/useGetUserGroupInvites";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useAcceptGroupInvite } from "api/client/hooks/groupInvites/useAcceptGroupInvite";
import { useDeclineGroupInvite } from "api/client/hooks/groupInvites/useDeclineGroupInvite";
import ProgressWheel from "components/progressWheel";
import { useGetTournamentStages } from "api/client/hooks/stages/useGetTournamentStages";
import {
  groupRoleEnum,
  IStageResponseWithTournament,
  ITournamentResponse,
} from "@tournament-app/types";
import { formatDateTime } from "utils/mixins/formatting";
import { useUpdateStage } from "api/client/hooks/stages/useUpdateStage";
import EditStageForm from "views/editStageForm";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import { useGetGroup } from "api/client/hooks/groups/useGetGroup";
import { useGetCompetition } from "api/client/hooks/competitions/useGetCompetition";
import { useGetContestParticipatingGroups } from "api/client/hooks/groups/useGetContestParticipatingGroups";
import ViewRoster from "views/viewRoster";
import Chip from "components/chip";

export default function ManageStages(stage?: {
  stage?: IStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const editMutation = useUpdateStage(stage?.stage?.tournamentId);

  const { data: groupData } = useGetContestParticipatingGroups(
    stage?.stage?.tournamentId,
  );

  const { data: tData } = useGetCompetition(stage?.stage?.tournament?.id ?? -1);
  const { data, isLoading } = useCheckIfGroupMember(
    (tData && tData.affiliatedGroup?.id) ?? -1,
  );

  useEffect(() => {
    console.log(
      "PARTICIPAIRIASJODSA GROUPS",
      groupData,
      stage?.stage?.tournamentId,
    );
  }, [groupData]);

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
      )}
    >
      <Dialog
        active={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variant={theme}
      >
        <EditStageForm mutation={editMutation} stage={stage?.stage} />
      </Dialog>
      <div className={styles.header}>
        <h3 className={globals[`${theme}Color`]}>
          {stage?.stage?.tournament?.name}
        </h3>
      </div>
      <div
        key={stage?.stage?.id}
        className={clsx(
          styles.stageItem,
          globals[`${textColorTheme}MutedBackgroundColor`],
        )}
      >
        <h4 className={styles.title}>
          {stage?.stage?.name}{" "}
          {stage?.stage?.startDate && stage?.stage?.endDate && (
            <span className={globals.label}>
              ({formatDateTime(stage?.stage?.startDate)} -{" "}
              {formatDateTime(stage?.stage?.endDate)})
            </span>
          )}
        </h4>
        <p className={globals.label}>
          stage status{" "}
          <b className={styles.info}> {stage?.stage?.stageStatus}</b>
        </p>
        <p className={globals.label}>
          stage type <b className={styles.info}> {stage?.stage?.stageType}</b>
        </p>
        <p className={globals.label}>
          rosters participating{" "}
          <b className={styles.info}> {stage?.stage?.rostersParticipating}</b>
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
            {stage?.stage?.description}
          </Markdown>
        </div>
      </div>
      <div className={styles.actionButtons}>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          data &&
          (data.role == groupRoleEnum.ADMIN ||
            data.role == groupRoleEnum.OWNER) && (
            <Button
              variant="warning"
              onClick={() => setEditDialogOpen(true)}
              className={styles.actionButton}
              label="edit stage"
            />
          )
        )}
      </div>
      {(groupData?.length ?? -1) > 0 && (
        <div>
          <h3>manage rosters</h3>
          {groupData?.map((group) => {
            console.log(
              `\nGROUP: ${group.name}, ${group.id}, ${stage?.stage?.id}`,
            );
            return (
              <div className={styles.stageGroupRosterCard}>
                <Chip label={group.name} variant="secondary" />
                <ViewRoster groupId={group.id} stageId={stage?.stage?.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
