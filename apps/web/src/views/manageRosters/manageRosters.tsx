"use client";

import {
  IExtendedStageResponseWithTournament,
  IMiniParticipationResponseWithGroup,
  IRosterResponse,
} from "@tournament-app/types";
import { useGetManagedForPlayer } from "api/client/hooks/participations/useGetManagedForPlayer";
import { useGetUserGroupParticipations } from "api/client/hooks/participations/useGetUserGroupParticipations";
import { useGetParticipationRosters } from "api/client/hooks/rosters/useGetParticipationRosters";
import { useGetStageRostersManagedByUser } from "api/client/hooks/rosters/useGetStageRostersManagedByUser";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import Dropdown from "components/dropdown";
import ProgressWheel from "components/progressWheel";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddRosterForm from "views/addRosterForm";
import EditRosterForm from "views/editRosterForm";
import styles from "./manageRosters.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function ManageRosters({
  stage,
}: {
  stage: IExtendedStageResponseWithTournament;
}) {
  const { data: rosters, isLoading } = useGetStageRostersManagedByUser(
    stage.id,
  );
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [activeParticipation, setActiveParticipation] =
    useState<IMiniParticipationResponseWithGroup>();

  const { data: groupsData, isLoading: groupsIsLoading } =
    useGetUserGroupParticipations(stage?.tournament?.id);

  const { data: rostersData, isLoading: isLoadingRosters } =
    useGetParticipationRosters(activeParticipation?.id);

  const [createRosterModalActive, setCreateRosterModalActive] =
    useState<boolean>(false);

  return (
    <div className={styles.wrapper}>
      <Dialog
        active={createRosterModalActive}
        onClose={() => setCreateRosterModalActive(false)}
        className={styles.dialogWrapper}
        variant={theme}
      >
        {groupsIsLoading ? (
          <ProgressWheel variant={textColorTheme}></ProgressWheel>
        ) : (
          <>
            {activeParticipation && (
              <AddRosterForm
                stage={stage}
                group={activeParticipation?.group}
                participationId={activeParticipation?.id}
                variant={textColorTheme}
              />
            )}
          </>
        )}
      </Dialog>
      {groupsIsLoading ? (
        <ProgressWheel variant={textColorTheme}></ProgressWheel>
      ) : (
        <div>
          <h2 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
            manage rosters {stage?.name && `for ${stage?.name}`}
          </h2>
          <Dropdown
            placeholder="select group"
            variant={textColorTheme}
            options={(groupsData ?? []).map((group) => {
              return {
                label: group?.group?.name,
              };
            })}
            onSelect={(index) => {
              if (index == -1) setActiveParticipation(undefined);
              if (!groupsData) return;
              if (groupsData) {
                const selectedGroup = groupsData[index];
                if (selectedGroup?.group) {
                  setActiveParticipation(selectedGroup);
                }
              }
            }}
            className={styles.dropdown}
          />
          {activeParticipation && (
            <div className={styles.rostersWrapper}>
              {rostersData &&
              (rostersData.pages[0].results.length ?? -1) > 0 ? (
                <div>
                  <p
                    className={clsx(
                      styles.title,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    active rosters
                  </p>
                  {rostersData.pages.map((page) => {
                    return page.results.map((roster) => {
                      return (
                        <RosterCard roster={roster} stage={stage}></RosterCard>
                      );
                    });
                  })}
                </div>
              ) : (
                <p className={globals[`${textColorTheme}Color`]}>
                  there are no active rosters!
                </p>
              )}
              <Button
                label={`create roster for ${activeParticipation?.group?.name}`}
                variant="primary"
                onClick={() => setCreateRosterModalActive(true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RosterCard({
  roster,
  stage,
}: {
  roster: IRosterResponse;
  stage: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  return (
    <div
      className={clsx(globals[`${textColorTheme}BackgroundColor`], styles.card)}
    >
      <Dialog active={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <EditRosterForm
          variant={textColorTheme}
          stage={stage}
          roster={roster}
          onClose={() => setEditDialogOpen(false)}
        />
      </Dialog>
      <div className={styles.playerCards}>
        {roster.players?.map((player) => (
          <div
            className={clsx(
              styles.playerCard,
              globals[`${theme}BackgroundColor`],
            )}
          >
            <Chip label={player.user.username} variant={textColorTheme} />
            {player?.career?.map((career) => {
              return (
                <Chip label={career.category.name} variant="secondary">
                  {career.category.name}
                </Chip>
              );
            })}
            {player.isSubstitute && (
              <p className={globals.warningColor}>substitute player</p>
            )}
          </div>
        ))}
      </div>
      <div className={styles.actionButtons}>
        <Button
          variant="warning"
          onClick={() => setEditDialogOpen(true)}
          className={styles.actionButton}
        >
          <EditIcon
            className={clsx(styles.actionButtonIcon, globals.lightFillChildren)}
          ></EditIcon>
        </Button>
      </div>
    </div>
  );
}
