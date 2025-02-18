"use client";

import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import globals from "styles/globals.module.scss";
import Navbar from "views/navbar";
import ManageUser from "views/manageUser";
import { clsx } from "clsx";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ManageTeams from "views/manageTeams";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Dialog from "components/dialog";
import CreateTeamForm from "views/createTeamForm";
import { useCreateGroup } from "api/client/hooks/groups/useCreateGroup";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";
import ProgressWheel from "components/progressWheel";

export default function Teams() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { theme } = useThemeContext();
  const router = useRouter();
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const textColorTheme = textColor(theme);

  const { data, isLoading, isSuccess } = useUserGroups();
  const createGroupMutation = useCreateGroup();

  useEffect(() => {
    console.log(data);
    if (!isSuccess && !isLoading) router.push("/");
  }, [isLoading]);

  const backward = () => {
    setActiveTab((tab) => {
      if (!data?.results) return 0;
      return (tab - 1) % data?.results?.length;
    });
  };

  const forward = () => {
    setActiveTab((tab) => {
      if (!data?.results) return 0;
      return (tab + 1) % data?.results?.length;
    });
  };

  useEffect(() => {
    createGroupMutation.isSuccess && setDialogActive(false);
  }, [createGroupMutation.isSuccess]);

  return (
    <div className={styles.wrapper}>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      >
        <CreateTeamForm mutation={createGroupMutation} />
      </Dialog>
      <Navbar className={styles.navbar} />
      {isLoading || data?.results == null ? (
        <div className={styles.progressWheelWrapper}>
          <ProgressWheel variant={textColorTheme} />
        </div>
      ) : (
        <div className={clsx(styles.screen)}>
          <div
            className={clsx(
              styles.tabs,
              globals[`${textColor(theme)}BackgroundColor`],
            )}
          >
            <button
              className={clsx(styles.button)}
              title="back"
              onClick={backward}
              disabled={activeTab <= 0}
            >
              <ArrowBackIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <div className={styles.teamsWrapper}>
              {data?.results.map((tab, index) => (
                <Button
                  key={index}
                  className={clsx(
                    styles.tab,
                    activeTab === index && styles.active,
                    activeTab === index && globals.primaryBackgroundColor,
                    ((index !== activeTab && index !== activeTab + 1) ||
                      (index === data?.results.length - 2 &&
                        activeTab == data?.results.length - 1)) &&
                      styles.hidden,
                  )}
                  onClick={() => setActiveTab(index)}
                  label={tab?.group.name}
                  variant={activeTab === index ? "primary" : textColor(theme)}
                />
              ))}
            </div>
            <button
              className={clsx(styles.button)}
              title="forward"
              onClick={forward}
              disabled={activeTab >= data?.results.length - 2}
            >
              <ArrowForwardIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <button
              className={clsx(styles.button)}
              title="create team"
              onClick={forward}
              disabled={activeTab >= data?.results.length - 2}
            >
              <AddIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
          </div>
          <ManageTeams team={data?.results[activeTab]} />
        </div>
      )}
    </div>
  );
}
