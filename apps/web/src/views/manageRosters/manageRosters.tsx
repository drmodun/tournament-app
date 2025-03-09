"use client";

import {
  IExtendedStageResponseWithTournament,
  IMiniGroupResponseWithLogo,
  IRosterResponse,
} from "@tournament-app/types";
import { useGetStageRostersManagedByUser } from "api/client/hooks/rosters/useGetStageRostersManagedByUser";
import { clsx } from "clsx";
import Chip from "components/chip";
import Dialog from "components/dialog";
import Dropdown from "components/dropdown";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { extractUniqueGroupsFromRosters } from "utils/mixins/helpers";
import AddRosterForm from "views/addRosterForm";
import styles from "./manageRosters.module.scss";

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
  const [groups, setGroups] = useState<IMiniGroupResponseWithLogo[]>([]);
  const [activeGroup, setActiveGroup] = useState<number>(-1);

  useEffect(() => {
    if (isLoading) return;
    if (rosters) {
      const _groups = extractUniqueGroupsFromRosters(rosters);
      setGroups(_groups);
    }
  }, [rosters, isLoading]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.rosters}>
        <Dropdown
          options={[
            ...groups.map((group) => {
              return { label: group.name, id: group.id };
            }),
            { label: "all" },
          ]}
          placeholder="select group"
          onSelect={(index: number) => {
            if (index == groups.length) setActiveGroup(-1);
            else setActiveGroup(index);
          }}
          doesSearch={true}
          searchPlaceholder="search..."
        />
        {activeGroup == -1
          ? rosters?.map((roster) => (
              <RosterCard roster={roster} stage={stage} />
            ))
          : rosters
              ?.filter(
                (roster) =>
                  roster.participation?.group?.id == groups[activeGroup].id,
              )
              .map((roster) => <RosterCard roster={roster} stage={stage} />)}
      </div>
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

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <div
      className={clsx(
        globals[`${textColorTheme}BackgroundColor`],
        globals[`${theme}Color`],
        styles.card,
      )}
      onClick={() => setDialogOpen(true)}
    >
      <Dialog active={dialogOpen} onClose={() => setDialogOpen(false)}>
        <AddRosterForm
          stage={stage}
          group={roster?.participation?.group}
          participation={roster.participation}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>

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
  );
}
