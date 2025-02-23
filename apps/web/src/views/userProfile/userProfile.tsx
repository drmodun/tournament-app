"use client";

import styles from "./userProfile.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Dialog from "components/dialog";
import Button from "components/button";
import Input from "components/input";
import Chip from "components/chip";
import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "utils/hooks/useThemeContext";
import CheckboxGroup from "components/checkboxGroup";
import { textColor } from "types/styleTypes";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RichEditor from "components/richEditor";
import Dropdown from "components/dropdown";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import EditIcon from "@mui/icons-material/Edit";
import {
  groupRoleEnum,
  IExtendedUserResponse,
  IGroupMembershipResponse,
  IGroupMembershipResponseWithDates,
} from "@tournament-app/types";
import { useGroupJoinRequests } from "api/client/hooks/groups/useGroupJoinRequests";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import AddLFPForm from "views/addLFPForm";
import ViewLFP from "views/viewLFP";
import ManageTeamMembers from "views/manageTeamMembers";
import EditTeamForm from "views/editTeamForm";
import { useEditGroup } from "api/client/hooks/groups/useEditGroup";
import Link from "next/link";
import { useFollowUser } from "api/client/hooks/followers/useFollowUser";
import { useUnfollowUser } from "api/client/hooks/followers/useUnfollowUser";
import { useCheckIfFollowingUser } from "api/client/hooks/followers/useCheckIfFollowingUser";
import { useToastContext } from "utils/hooks/useToastContext";
import { useAuth } from "api/client/hooks/auth/useAuth";
import ProgressWheel from "components/progressWheel";

export default function UserProfile({ user }: { user: IExtendedUserResponse }) {
  const { theme } = useThemeContext();
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();
  const { data, isLoading } = useCheckIfFollowingUser(user.id);
  const textColorTheme = textColor(theme);
  const { data: authData } = useAuth();
  const [buttonFollowed, setButtonFollowed] = useState<boolean | null>(null);

  const handleFollow = async () => {
    await followUserMutation.mutateAsync(user.id);
    if (!followUserMutation.isError) setButtonFollowed(true);
  };

  const handleUnfollow = async () => {
    await unfollowUserMutation.mutateAsync(user.id);
    if (!unfollowUserMutation.isError) setButtonFollowed(false);
  };

  return (
    <div className={clsx(styles.wrapper, globals[`${theme}BackgroundColor`])}>
      <div className={clsx(globals[`${textColorTheme}Color`], styles.top)}>
        <img
          src={user?.profilePicture}
          alt="Profile picture"
          className={clsx(styles.pfp)}
          onError={(e) => {
            e.currentTarget.src = "/profilePicture.png";
          }}
        />
        <div className={styles.usernameEdit}>
          <p
            className={clsx(
              styles.username,
              globals.largeText,
              styles.infoText,
            )}
          >
            {user?.name}{" "}
            <span className={styles.usernameSpan}>({user?.username})</span>
          </p>
        </div>
      </div>
      <div
        className={clsx(
          styles.detailsWrapper,
          globals[`${textColorTheme}Color`],
        )}
      >
        <div className={styles.userInfo}>
          <b className={styles.boldText}>location</b>
          <p className={clsx(styles.infoText)}>
            {user?.location.toLowerCase()}
          </p>
        </div>
        <div className={styles.userInfo}>
          <b className={styles.boldText}>country</b>
          <p
            className={clsx(styles.infoText)}
          >{`${user?.country} ${getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[user.country] ?? "ZZ")}`}</p>
        </div>
        <div className={styles.userInfo}>
          <b className={styles.boldText}>level</b>
          <p className={clsx(styles.infoText)}>{user?.level}</p>
        </div>
        <div className={styles.userInfo}>
          <b className={clsx(styles.boldText)}>registered</b>
          <p className={clsx(styles.infoText)}>
            {user?.createdAt && formatDate(new Date(user?.createdAt))}
          </p>
        </div>
        <div className={clsx(styles.userInfo, styles.bio)}>
          <b className={styles.boldText}>bio</b>
          <p className={styles.descriptionText}>
            <RichEditor
              startingContent={user?.bio ?? "no bio yet."}
              editable={false}
              variant={textColorTheme}
            />
          </p>
        </div>
        <div className={styles.userInfo}>
          <b className={styles.boldText}>followers</b>
          <p className={clsx(styles.infoText)}>{user.followers}</p>
        </div>
        <div className={styles.userInfo}>
          <b className={styles.boldText}>following</b>
          <p className={clsx(styles.infoText)}>{user.following}</p>
        </div>
      </div>
      <div className={styles.bottom}>
        {!isLoading &&
          authData &&
          authData?.id !== user.id &&
          ((buttonFollowed === null && data) || buttonFollowed ? (
            <Button
              variant="danger"
              label="unfollow user"
              onClick={handleUnfollow}
              className={styles.submitButton}
            />
          ) : (
            <Button
              variant="secondary"
              label="follow user"
              onClick={handleFollow}
              className={styles.submitButton}
            />
          ))}
      </div>
    </div>
  );
}
