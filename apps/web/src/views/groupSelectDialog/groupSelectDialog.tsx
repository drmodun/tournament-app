"use client";

import styles from "./groupSelectDialog.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ProgressWheel from "components/progressWheel";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";
import { useAdminUserGroups } from "api/client/hooks/groups/useAdminUserGroups";
import { useCreatorUserGroups } from "api/client/hooks/groups/useCreatorUserGroups";
import Button from "components/button";
import { useCreateGroupParticipation } from "api/client/hooks/participations/useCreateGroupParticipation";
import { useCheckIfGroupIsParticipating } from "api/client/hooks/participations/useCheckIfGroupIsParticipating";
import { useAuth } from "api/client/hooks/auth/useAuth";

export default function GroupSelectDialog({
  competitionId,
}: {
  competitionId: number | undefined;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [adminPage, setAdminPage] = useState<number>(0);
  const [creatorPage, setCreatorPage] = useState<number>(0);
  const [adminFetchLimit, setAdminFetchLimit] = useState<number>(-1);
  const [creatorFetchLimit, setCreatorFetchLimit] = useState<number>(-1);
  const [selectedGroup, setSelectedGroup] = useState<number>(-1);
  const {
    data: adminData,
    isLoading: adminIsLoading,
    fetchNextPage: adminFetchNextPage,
    isFetchingNextPage: adminIsFetchingNextPage,
    isFetchingPreviousPage: adminIsFetchingPreviousPage,
    isFetchNextPageError: adminIsFetchNextPageError,
    isFetchPreviousPageError: adminIsFetchPreviousPageError,
    fetchPreviousPage: adminFetchPreviousPage,
  } = useAdminUserGroups();
  const {
    data: creatorData,
    isLoading: creatorIsLoading,
    fetchNextPage: creatorFetchNextPage,
    isFetchingNextPage: creatorIsFetchingNextPage,
    isFetchingPreviousPage: creatorIsFetchingPreviousPage,
    isFetchNextPageError: creatorIsFetchNextPageError,
    isFetchPreviousPageError: creatorIsFetchPreviousPageError,
    fetchPreviousPage: creatorFetchPreviousPage,
  } = useCreatorUserGroups();
  const { data } = useAuth();

  const joinGroupMutation = useCreateGroupParticipation();
  const participationCheckMutation = useCheckIfGroupIsParticipating();

  const forward = async (forAdmin: boolean = false) => {
    let nextPage;

    if (forAdmin) nextPage = await adminFetchNextPage();
    else nextPage = await creatorFetchNextPage();

    if (
      forAdmin &&
      (adminIsFetchNextPageError ||
        (nextPage.data?.pages[adminPage + 1]?.results?.length ?? -1) == 0)
    ) {
      setAdminFetchLimit(adminPage);
      return;
    } else if (forAdmin) {
      setAdminPage((curr) => curr + 1);
      return;
    }

    if (
      creatorIsFetchNextPageError ||
      (nextPage.data?.pages[creatorPage + 1]?.results?.length ?? -1) == 0
    ) {
      setCreatorFetchLimit(creatorPage);
      return;
    }

    setCreatorPage((curr) => curr + 1);
  };

  const backward = async (forAdmin: boolean = false) => {
    if (forAdmin) {
      if (adminPage == 0) return;
      await adminFetchPreviousPage();

      setAdminPage((curr) => curr - 1);
    } else {
      if (creatorPage == 0) return;
      await creatorFetchPreviousPage();

      setCreatorPage((curr) => curr - 1);
    }
  };

  const join = async () => {
    if (selectedGroup === -1 || !competitionId || !data) return;
    const participationCheck = await participationCheckMutation.mutateAsync({
      tournamentId: competitionId,
      groupId: selectedGroup,
    });

    if (
      participationCheckMutation.isError ||
      (participationCheck?.results?.length ?? -1) <= 0
    ) {
      await joinGroupMutation.mutateAsync({
        id: competitionId,
        groupId: selectedGroup,
        userId: data!.id,
      });
    }
  };

  return (
    <div className={clsx(styles.wrapper)}>
      <p>
        <b className={globals[`${textColorTheme}Color`]}>groups you own</b>
      </p>
      {creatorIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.groupsWrapper}>
          <ArrowBackIcon
            onClick={backward}
            className={clsx(
              styles.arrow,
              creatorPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
          <div className={styles.groupsInnerWrapper}>
            {creatorIsFetchingNextPage ? (
              <ProgressWheel variant={textColorTheme} />
            ) : (
              creatorData?.pages[creatorPage]?.results?.map((group) => {
                return (
                  <div
                    onClick={() => setSelectedGroup(group?.groupId)}
                    className={clsx(
                      group.groupId === selectedGroup
                        ? [globals.primaryBackgroundColor, globals.lightColor]
                        : [
                            globals[`${textColorTheme}BackgroundColor`],
                            globals[`${theme}Color`],
                          ],
                      styles.groupInfoWrapper,
                    )}
                  >
                    <img
                      src={group?.group?.logo}
                      alt="group logo"
                      onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
                      className={styles.groupLogo}
                    />
                    <div
                      className={clsx(
                        styles.inherit,
                        styles.groupInfoTextWrapper,
                      )}
                    >
                      <p className={styles.inherit}>{group?.group?.name}</p>
                      <p className={globals.inherit}>
                        {group?.group?.abbreviation}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <ArrowForwardIcon
            onClick={forward}
            className={clsx(
              styles.arrow,
              adminPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
        </div>
      )}
      <p className={styles.secondTitle}>
        <b className={globals[`${textColorTheme}Color`]}>
          groups you administrate
        </b>
      </p>
      {adminIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.groupsWrapper}>
          <ArrowBackIcon
            onClick={() => backward(true)}
            className={clsx(
              styles.arrow,
              adminPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
          <div className={styles.groupsInnerWrapper}>
            {adminIsFetchingNextPage ? (
              <ProgressWheel variant={textColorTheme} />
            ) : (
              adminData?.pages[adminPage]?.results?.map((group) => {
                return (
                  <div
                    onClick={() => setSelectedGroup(group?.groupId)}
                    className={clsx(
                      group.groupId === selectedGroup
                        ? [globals.primaryBackgroundColor, globals.lightColor]
                        : [
                            globals[`${textColorTheme}BackgroundColor`],
                            globals[`${theme}Color`],
                          ],
                      styles.groupInfoWrapper,
                    )}
                  >
                    <img
                      src={group?.group?.logo}
                      alt="group logo"
                      onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
                      className={styles.groupLogo}
                    />
                    <div
                      className={clsx(
                        styles.inherit,
                        styles.groupInfoTextWrapper,
                      )}
                    >
                      <p className={styles.inherit}>{group?.group?.name}</p>
                      <p className={globals.inherit}>
                        {group?.group?.abbreviation}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <ArrowForwardIcon
            onClick={() => forward(true)}
            className={clsx(
              styles.arrow,
              adminPage == 0 ? styles.disabled : styles.enabled,
              globals[`${textColorTheme}FillChildren`],
            )}
          />
        </div>
      )}
      <Button
        disabled={selectedGroup === -1}
        label="join with group"
        variant="primary"
        className={styles.submitButton}
        onClick={join}
      />
    </div>
  );
}
