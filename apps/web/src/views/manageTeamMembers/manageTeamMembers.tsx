"use client";

import styles from "./manageTeamMembers.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor } from "types/styleTypes";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import {
  groupRoleEnumType,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
  IMiniUserResponseWithCountry,
  userRoleEnumType,
} from "@tournament-app/types";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ProgressWheel from "components/progressWheel";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import Link from "next/link";
import { useRemoveUserFromGroup } from "api/client/hooks/groups/useRemoveUserFromGroup";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import Button from "components/button";

type UserCardProps = {
  id: number;
  username: string;
  profilePicture: string;
  country: string;
  role: groupRoleEnumType;
  groupId: number;
};

const UserCard = ({
  id,
  username,
  profilePicture,
  country,
  role,
  groupId,
}: UserCardProps) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const removeUserMutation = useRemoveUserFromGroup();
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleRemove = () => {
    removeUserMutation.mutate({ userId: id, groupId: groupId });
  };

  useEffect(() => {
    if (removeUserMutation.isSuccess) setIsVisible(false);
  }, [removeUserMutation.isSuccess]);

  return (
    <div
      className={clsx(
        globals[`${textColorTheme}BackgroundColor`],
        styles.userCardWrapper,
        !isVisible && globals.hidden,
      )}
    >
      <Link
        href={`/user/${id}`}
        className={clsx(styles.noTextDecoration, styles.userCardLink)}
      >
        <div className={styles.userCardInnerWrapper}>
          <img
            src={profilePicture}
            alt={`${username}'s profile picture`}
            className={styles.userCardProfilePicture}
            onError={(e) => {
              e.currentTarget.src = "/profilePicture.png";
            }}
          />
          <div
            className={clsx(
              globals[`${theme}Color`],
              styles.userCardTextWrapper,
            )}
            title={username}
          >
            <b className={styles.userCardText}>{username}</b>
            <p className={styles.userCardText}>
              {country &&
                getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[country] ?? "ZZ")}
            </p>
            <p className={styles.userCardText}>{role}</p>
          </div>
        </div>
      </Link>
      <button
        onClick={handleRemove}
        className={clsx(
          styles.userCardRemoveButton,
          globals.dangerBackgroundColor,
        )}
      >
        <PersonRemoveIcon
          className={clsx(
            globals.lightFillChildren,
            styles.userCardCloseButton,
          )}
        />
      </button>
    </div>
  );
};

export default function ManageTeamMembers({ teamId }: { teamId: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data: groupMembers,
    isLoading: groupMembersIsLoading,
    fetchNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  } = useGetGroupMembers(teamId);
  const [activePage, setActivePage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);

  useEffect(() => {
    console.log("diwoa", groupMembers);
  }, [groupMembers]);

  const forward = async () => {
    if (activePage == fetchLimit) return;
    const nextPage = await fetchNextPage();
    if (nextPage.data?.pages[activePage]?.members?.length == 0) {
      setFetchLimit(activePage);
      return;
    }

    setActivePage((prev) => prev + 1);
  };

  return (
    <div className={clsx(styles.wrapper)}>
      {groupMembersIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <>
          <p className={styles.title}>
            <b className={globals[`${textColorTheme}Color`]}>team members</b>
            <Button
              onClick={forward}
              disabled={
                activePage == fetchLimit ||
                isFetchNextPageError ||
                isFetchingNextPage
              }
              variant={textColorTheme}
              label="load more"
              className={styles.loadMoreButton}
            />
          </p>
          <div className={styles.groupMembers}>
            {groupMembers?.pages[0].members?.length == 0 || !groupMembers ? (
              <p>there are no team members!</p>
            ) : (
              groupMembers?.pages.flatMap((e) =>
                e?.members?.flatMap(
                  (member: {
                    id: number;
                    username: string;
                    profilePicture: string;
                    country: string;
                    createdAt: string;
                    role: groupRoleEnumType;
                  }) => <UserCard {...member} groupId={teamId} />,
                ),
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
