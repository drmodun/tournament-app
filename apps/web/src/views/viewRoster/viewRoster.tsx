"use client";

import { IExtendedStageResponseWithTournament } from "@tournament-app/types";
import { useGetGroupRostersQuery } from "api/client/hooks/rosters/useGetGroupRostersQuery";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import AddRosterForm from "views/addRosterForm";
import { GroupParticipationType } from "views/manageStage/manageStage";
import styles from "./viewRoster.module.scss";

export default function ViewRoster({
  stage,
  group,
}: {
  group?: GroupParticipationType;
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const { data } = useGetGroupRostersQuery({
    stageId: stage?.id,
    groupId: group?.group?.id,
  });

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div
      className={clsx(
        globals[`${theme}BackgroundColor`],
        globals[`${textColorTheme}Color`],
        styles.card,
      )}
    >
      <Dialog active={dialogOpen} onClose={() => setDialogOpen(false)}>
        <AddRosterForm stage={stage} group={group} />
      </Dialog>
      {(data?.pages[0]?.results?.length ?? -1) <= 0 ? (
        <div>
          <Button
            variant={textColorTheme}
            className={styles.actionButton}
            label="create roster"
            onClick={() => setDialogOpen(true)}
          />
        </div>
      ) : (
        data?.pages[0]?.results[0]?.players?.map((player) => (
          <div>
            <Chip label={player.user.username} variant={textColorTheme} />
            {player?.career?.map((career) => {
              return (
                <Chip label={career.category.name} variant="secondary">
                  {career.elo}
                </Chip>
              );
            })}
            {player.isSubstitute && (
              <p className={globals.warningColor}>substitute player</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
