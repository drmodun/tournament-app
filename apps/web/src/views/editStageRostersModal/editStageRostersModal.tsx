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
import AddIcon from "@mui/icons-material/Add";
import Dialog from "components/dialog";

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
  const [addRosterModalActive, setAddRosterModalActive] =
    useState<boolean>(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.manageRostersTitle}>
        <h3 className={clsx(globals[`${textColorTheme}Color`])}>
          manage your rosters
        </h3>
        <button className={styles.addButton}>
          <AddIcon className={clsx(globals[`${textColorTheme}FillChildren`])} />
        </button>
      </div>
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
          <p className={globals[`${textColorTheme}Color`]}>
            you have no rosters!
          </p>
        </div>
      )}
    </div>
  );
}
