"use client";

import {
  groupRoleEnum,
  IExtendedStageResponseWithTournament,
} from "@tournament-app/types";
import { useGetCompetition } from "api/client/hooks/competitions/useGetCompetition";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import { useGetManagedForPlayer } from "api/client/hooks/participations/useGetManagedForPlayer";
import { useUpdateStage } from "api/client/hooks/stages/useUpdateStage";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import EditStageForm from "views/editStageForm";
import ViewRoster from "views/viewRoster";
import styles from "./manageStage.module.scss";

export type GroupParticipationType = {
  id: number;
  tournamentId: number;
  groupId: number;
  userId: number;
  group: {
    id: number;
    name: string;
    abbreviation: string;
    locationId: number;
    logo: string;
  };
};

export default function ManageStages(stage?: {
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const editMutation = useUpdateStage(stage?.stage?.tournamentId);

  const { data: participationData } = useGetManagedForPlayer(
    stage?.stage?.tournamentId,
  );

  const { data: tData } = useGetCompetition(stage?.stage?.tournament?.id ?? -1);
  const { data, isLoading } = useCheckIfGroupMember(
    (tData && tData.affiliatedGroup?.id) ?? -1,
  );

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
      {(participationData?.length ?? -1) > 0 && (
        <div>
          <h3>manage rosters</h3>
          {participationData?.map((group: GroupParticipationType) => {
            return (
              <div className={styles.stageGroupRosterCard}>
                <Chip label={group.group.name} variant="secondary" />
                <ViewRoster group={group} stage={stage?.stage} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
