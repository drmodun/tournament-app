import { useGetParticipationRosters } from "api/client/hooks/rosters/useGetParticipationRoster";
import styles from "./editStageRostersModal.module.scss";
import globals from "styles/globals.module.scss";
import { useEffect, useState } from "react";
import { useGetStageRostersManagedByUser } from "api/client/hooks/rosters/useGetStageRostersManagedByUser";
import EditRosterForm from "views/editRosterForm";
import { IExtendedStageResponseWithTournament } from "@tournament-app/types";
import ProgressWheel from "components/progressWheel";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { clsx } from "clsx";
import { textColor } from "types/styleTypes";

export default function EditStageRostersModal({
  stage,
  onClose,
}: {
  onClose?: () => void;
  stage?: IExtendedStageResponseWithTournament;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetStageRostersManagedByUser(stage?.id);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    console.log(stage, data, "test");
  }, [data]);

  return (
    <div className={styles.wrapper}>
      {isLoading ? (
        <ProgressWheel></ProgressWheel>
      ) : (data?.length ?? 0) > 0 ? (
        <div className={styles.contentWrapper}>
          <div
            className={clsx(
              styles.tabs,
              globals[`${textColorTheme}BackgroundColor`],
            )}
          >
            {data?.map((elem, index) => {
              console.log("element", elem.id);
              return (
                <button
                  onClick={() => setActiveIndex(index)}
                  className={clsx(
                    styles.tab,
                    index == activeIndex
                      ? [
                          globals[`${theme}BackgroundColorDynamic`],
                          globals[`${textColorTheme}Color`],
                        ]
                      : [
                          globals[`${textColorTheme}BackgroundColor`],
                          globals[`${theme}Color`],
                        ],
                  )}
                  key={elem.id}
                >
                  <p className={globals[`${textColorTheme}Color`]}>
                    {elem.participation?.group?.name}
                  </p>
                </button>
              );
            })}
          </div>
          <div className={styles.rosterEditForm}>
            <EditRosterForm
              stage={stage}
              onClose={onClose}
              roster={data?.[activeIndex] ?? undefined}
            ></EditRosterForm>
          </div>
        </div>
      ) : (
        <div>
          <p className={globals[`${theme}Color`]}>you have no rosters!</p>
        </div>
      )}
    </div>
  );
}
