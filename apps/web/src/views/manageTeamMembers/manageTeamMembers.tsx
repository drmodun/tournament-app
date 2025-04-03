"use client";

import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { groupRoleEnum, groupRoleEnumType } from "@tournament-app/types";
import { useGetGroupMembers } from "api/client/hooks/groups/useGetGroupMembers";
import { useRemoveUserFromGroup } from "api/client/hooks/groups/useRemoveUserFromGroup";
import { clsx } from "clsx";
import ProgressWheel from "components/progressWheel";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
import styles from "./manageTeamMembers.module.scss";
import { useCheckIfGroupMember } from "api/client/hooks/groups/useCheckIfGroupMember";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { usePromoteUser } from "api/client/hooks/groups/usePromoteUser";
import { useDemoteUser } from "api/client/hooks/groups/useDemoteUser";

type UserCardProps = {
  id: number;
  username: string;
  profilePicture: string;
  country: string;
  role: groupRoleEnumType;
  groupId: number;
  membership: any;
};

const UserCard = ({
  id,
  username,
  profilePicture,
  country,
  role,
  groupId,
  membership,
}: UserCardProps) => {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const removeUserMutation = useRemoveUserFromGroup();
  const promoteUserMutation = usePromoteUser();
  const demoteUserMutation = useDemoteUser();
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleRemove = () => {
    removeUserMutation.mutate({ userId: id, groupId: groupId });
  };

  const handlePromote = () => {
    promoteUserMutation.mutate({ userId: id, groupId: groupId });
  };

  const handleDemote = () => {
    demoteUserMutation.mutate({ userId: id, groupId: groupId });
  };

  useEffect(() => {
    if (removeUserMutation.isSuccess) setIsVisible(false);
    console.log("role", membership?.role);
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
      {(membership?.role === groupRoleEnum.ADMIN ||
        membership?.role === groupRoleEnum.OWNER) && (
        <div className={styles.actionButtons}>
          {role == groupRoleEnum.MEMBER && (
            <button
              onClick={handlePromote}
              className={clsx(
                styles.userCardRemoveButton,
                globals.warningBackgroundColor,
              )}
            >
              <KeyboardDoubleArrowUpIcon
                className={clsx(
                  globals.lightFillChildren,
                  styles.userCardCloseButton,
                )}
              />
            </button>
          )}
          {role == groupRoleEnum.ADMIN && (
            <button
              onClick={handleDemote}
              className={clsx(
                styles.userCardRemoveButton,
                globals.warningBackgroundColor,
              )}
            >
              <KeyboardDoubleArrowDownIcon
                className={clsx(
                  globals.lightFillChildren,
                  styles.userCardCloseButton,
                )}
              />
            </button>
          )}
          {role !== groupRoleEnum.OWNER && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default function ManageTeamMembers({ teamId }: { teamId: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data: groupMembers, isLoading: groupMembersIsLoading } =
    useGetGroupMembers(teamId);
  const { data: membershipData, isLoading: membershipDataIsLoading } =
    useCheckIfGroupMember(teamId);

  const { data } = useAuth();

  useEffect(() => {
    console.log(membershipData, "data!");
  }, [membershipData]);

  return (
    <div className={clsx(styles.wrapper)}>
      {groupMembersIsLoading || membershipDataIsLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <>
          <p className={styles.title}>
            <b className={globals[`${textColorTheme}Color`]}>team members</b>
          </p>
          <div className={styles.groupMembers}>
            {groupMembers?.members?.length === 0 || !groupMembers ? (
              <p>there are no team members!</p>
            ) : (
              groupMembers?.members?.map((member) => {
                if (member.id == data?.id) return;
                return (
                  <UserCard
                    membership={membershipData}
                    key={member.id}
                    {...member}
                    groupId={teamId}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
