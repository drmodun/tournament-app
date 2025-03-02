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
import ManageRosters from "views/manageRosters";

export default function Rosters() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(0);
  const { theme } = useThemeContext();
  const router = useRouter();
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const textColorTheme = textColor(theme);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);

  const {
    data,
    isLoading,
    isSuccess,
    fetchNextPage,
    fetchPreviousPage,
    isFetchNextPageError,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetchPreviousPageError,
  } = useUserGroups();
  const createGroupMutation = useCreateGroup();

  useEffect(() => {
    createGroupMutation.isSuccess && setDialogActive(false);
  }, [createGroupMutation.isSuccess, data]);

  useEffect(() => {
    console.log("GROUP DATA", data);
  }, [data]);

  const forward = async () => {
    if ((data?.pages[activePage]?.results?.length ?? -1) < 2) return;

    const page = await fetchNextPage();

    if (
      isFetchNextPageError ||
      (page.data?.pages[activePage + 1]?.results?.length ?? -1) == 0
    ) {
      setFetchLimit(activePage);
      return;
    }

    setActivePage((curr) => curr + 1);
    setActiveTab(0);
  };

  const backward = async () => {
    if (activePage === 0) return;

    await fetchPreviousPage();

    setActivePage((curr) => curr - 1);
    setActiveTab(0);
  };

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
      {isLoading ? (
        <div className={styles.progressWheelWrapper}>
          <ProgressWheel variant={textColorTheme} />
        </div>
      ) : (data?.pages[0]?.results?.length ?? 0) > 0 ? (
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
              disabled={
                isFetchPreviousPageError ||
                isFetchingPreviousPage ||
                isFetching ||
                isLoading ||
                activePage === 0
              }
            >
              <ArrowBackIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
            <div className={styles.teamsWrapper}>
              {[...(data?.pages[activePage]?.results ?? [])].map(
                (tab, index) => {
                  return (
                    <Button
                      key={index}
                      className={clsx(
                        styles.tab,
                        activeTab === index && styles.active,
                      )}
                      onClick={() => setActiveTab(index)}
                      label={tab.group.name}
                      variant={
                        activeTab === index ? "primary" : textColor(theme)
                      }
                    />
                  );
                },
              )}
            </div>
            <button
              className={clsx(styles.button)}
              title="forward"
              onClick={forward}
              disabled={
                isFetchNextPageError ||
                isFetchingNextPage ||
                isFetching ||
                isLoading ||
                fetchLimit === activePage
              }
            >
              <ArrowForwardIcon className={clsx(styles[`${theme}Fill`])} />
            </button>
          </div>

          <ManageRosters
            group={data?.pages[Math.floor(activePage)]?.results[activeTab]}
          />
        </div>
      ) : (
        <div className={styles.noTeams}>
          <p
            className={clsx(
              globals[`${textColorTheme}Color`],
              globals.largeText,
            )}
          >
            you have no teams!
          </p>
        </div>
      )}
    </div>
  );
}
