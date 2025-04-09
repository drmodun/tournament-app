"use client";

import {
  groupRoleEnum,
  IExtendedStageResponseWithTournament,
  stageStatusEnum,
} from "@tournament-app/types";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useGetCompetition } from "api/client/hooks/competitions/useGetCompetition";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import { useGetManagedForPlayer } from "api/client/hooks/participations/useGetManagedForPlayer";
import { useStartStage } from "api/client/hooks/stages/useStartStage";
import { useUpdateStage } from "api/client/hooks/stages/useUpdateStage";
import { clsx } from "clsx";
import Button from "components/button";
import Dialog from "components/dialog";
import ProgressWheel from "components/progressWheel";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTime } from "utils/mixins/formatting";
import EditStageForm from "views/editStageForm";
import EditStageRostersModal from "views/editStageRostersModal";
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

  const [editRostersDialogOpen, setEditRostersDialogOpen] =
    useState<boolean>(false);

  const { data: participationData, isLoading: isParticipationDataLoading } =
    useGetManagedForPlayer(
      stage?.stage?.tournamentId ?? stage?.stage?.tournament.id
    );

  const { data: tData } = useGetCompetition(
    stage?.stage?.tournamentId ?? stage?.stage?.tournament.id ?? -1
  );
  const { data, isLoading } = useCheckIfGroupMember(
    (tData && tData.affiliatedGroup?.id) ?? -1
  );

  const { data: userData } = useAuth();

  const startStageMutation = useStartStage();

  return (
    <div
      className={clsx(
        styles.wrapper,
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`]
      )}
    >
      <Dialog
        active={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        variant={theme}
      >
        <EditStageForm
          mutation={editMutation}
          stage={stage?.stage}
          onClose={() => setEditDialogOpen(false)}
        />
      </Dialog>
      <Dialog
        onClose={() => setEditRostersDialogOpen(false)}
        active={editRostersDialogOpen}
        variant={theme}
      >
        <EditStageRostersModal
          stage={stage?.stage}
          onClose={() => setEditDialogOpen(false)}
        />
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
          globals[`${textColorTheme}MutedBackgroundColor`]
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
          <b className={styles.info}>
            {" "}
            {stage?.stage?.stageStatus ?? "undetermined"}
          </b>
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
              styles.description
            )}
            rehypePlugins={[rehypeRaw]}
          >
            {stage?.stage?.description}
          </Markdown>
        </div>
      </div>
      <div className={styles.actionButtons}>
        {isLoading || isParticipationDataLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <div className={styles.actionButtons}>
            {(data?.role == groupRoleEnum.ADMIN ||
              data?.role == groupRoleEnum.OWNER ||
              tData?.creator.id == userData?.id) && (
              <>
                {stage?.stage?.stageStatus !== stageStatusEnum.ONGOING &&
                  stage?.stage?.stageStatus !== stageStatusEnum.FINISHED && (
                    <Button
                      variant="primary"
                      onClick={() =>
                        startStageMutation.mutate(stage?.stage?.id ?? -1)
                      }
                      className={styles.actionButton}
                      label="start stage"
                    />
                  )}
                <Button
                  variant="warning"
                  onClick={() => setEditDialogOpen(true)}
                  className={styles.actionButton}
                  label="edit stage"
                />
              </>
            )}
            {participationData && participationData?.length > 0 && (
              <Link href={`/manageRosters/${stage?.stage?.id}`}>
                <Button
                  variant="warning"
                  className={styles.actionButton}
                  label="manage rosters"
                />
              </Link>
            )}
          </div>
        )}
      </div>
      <Link
        href={`/stage/${stage?.stage?.id}/bracket`}
        className={styles.actionButton}
      >
        <Button
          variant={theme}
          className={styles.actionButton}
          label="view bracket"
        />
      </Link>
      {(data?.role == groupRoleEnum.ADMIN ||
        data?.role == groupRoleEnum.OWNER ||
        tData?.creator.id == userData?.id) &&
        (stage?.stage?.stageStatus === stageStatusEnum.ONGOING ||
          stage?.stage?.stageStatus === stageStatusEnum.FINISHED) && (
          <Link
            href={`/manageUserManagedMatchups/${stage?.stage?.id}`}
            className={styles.actionButton}
          >
            <Button
              variant="warning"
              className={styles.actionButton}
              label="manage matchups"
            />
          </Link>
        )}
    </div>
  );
}
