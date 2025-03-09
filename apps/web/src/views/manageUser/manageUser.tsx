"use client";

import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import { IExtendedUserResponse } from "@tournament-app/types";
import { useUserGroups } from "api/client/hooks/groups/useUserGroups";
import { useDeleteUser } from "api/client/hooks/user/useDeleteUser";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import Dialog from "components/dialog";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES, formatDate } from "utils/mixins/formatting";
import UserEditForm from "views/userEditForm";
import UserFollowersDialog from "views/userFollowersModal";
import styles from "./manageUser.module.scss";

export default function ManageUser({
  data,
}: {
  data: IExtendedUserResponse | undefined;
}) {
  const [dialogActive, setDialogActive] = useState<boolean>(false);
  const [userFollowersDialog, setUserFollowersDialog] =
    useState<boolean>(false);

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const router = useRouter();

  const scrollRefTeams = useRef<HTMLDivElement>(null);

  const {
    data: groupData,
    fetchNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
    isFetching,
  } = useUserGroups(true);
  const deleteUserMutation = useDeleteUser(data?.id);
  return (
    <div className={styles.wrapper}>
      <Dialog
        active={dialogActive}
        onClose={() => setDialogActive(false)}
        variant={theme}
        className={styles.dialog}
      >
        <UserEditForm data={data} onClose={() => setDialogActive(false)} />
      </Dialog>
      <Dialog
        active={userFollowersDialog}
        onClose={() => setUserFollowersDialog(false)}
        variant={theme}
        className={styles.dialog}
      >
        <UserFollowersDialog />
      </Dialog>
      <div className={styles.profileEdit}>
        <button
          title="edit profile button"
          className={styles.editButton}
          onClick={() => setDialogActive(true)}
        >
          <EditIcon
            className={clsx(styles[`${textColorTheme}Fill`], styles.edit)}
          />
        </button>
        <img
          src={data?.profilePicture}
          alt="Profile picture"
          className={clsx(styles.pfp)}
          onError={(e) => {
            e.currentTarget.src = "/profilePicture.png";
          }}
        />
        <div
          className={clsx(
            styles.editWrapper,
            globals[`${textColorTheme}Color`],
          )}
        >
          <div className={styles.usernameEdit}>
            <p
              className={clsx(
                styles.username,
                globals.largeText,
                styles.infoText,
              )}
            >
              {data?.name}{" "}
              <span className={styles.usernameSpan}>({data?.username})</span>
            </p>
          </div>
          <div className={styles.userInfo}>
            <b className={styles.boldText}>country</b>
            <p
              className={clsx(styles.infoText)}
            >{`${data?.country} ${getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[data?.country ?? ""] ?? data?.country ?? "ZZ")}`}</p>
          </div>
          <div className={styles.userInfo}>
            <b className={styles.boldText}>level</b>
            <p className={clsx(styles.infoText)}>{data?.level}</p>
          </div>
          <div className={styles.userInfo}>
            <b className={clsx(styles.boldText)}>registered</b>
            <p className={clsx(styles.infoText)}>
              {data?.createdAt && formatDate(new Date(data?.createdAt))}
            </p>
          </div>
        </div>
      </div>
      <div className={clsx(styles.bottom, globals[`${textColorTheme}Color`])}>
        <div className={styles.description}>
          <b className={styles.boldText}>bio</b>
          <p className={styles.descriptionText}>
            <Markdown
              className={globals[`${textColorTheme}Color`]}
              rehypePlugins={[rehypeRaw]}
            >
              {data?.bio ?? "no bio yet."}
            </Markdown>
          </p>
        </div>

        <div className={styles.teamsEdit}>
          <b
            className={clsx(styles.teamText, globals[`${textColorTheme}Color`])}
          >
            teams
          </b>
          <div
            className={styles.teams}
            ref={scrollRefTeams}
            onWheel={(e) => {
              if (scrollRefTeams?.current) {
                scrollRefTeams.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
              }
            }}
          >
            {groupData?.pages.map((page) =>
              page.results.map((team) => (
                <div
                  className={styles.team}
                  onClick={() => router.push(`/group/${team?.groupId}`)}
                >
                  <Chip
                    key={team?.groupId}
                    label={team?.group?.name}
                    variant={textColorTheme}
                    className={styles.team}
                  />
                </div>
              )),
            )}
            {groupData?.pages[0].results.length === 0
              ? "no teams yet."
              : isFetchNextPageError ||
                isFetchingNextPage ||
                (isFetching && (
                  <Chip
                    key={"load team button"}
                    label="load more"
                    variant="secondary"
                    onClick={() => fetchNextPage()}
                  ></Chip>
                ))}
          </div>
        </div>
        <Link href="/manageTeams">
          <div className={styles.manageTeamsWrapper}>
            <p
              className={clsx(
                styles.manageTeamsText,
                globals[`${textColorTheme}Color`],
              )}
            >
              manage teams
            </p>
            <LaunchIcon className={clsx(styles[`${textColorTheme}Fill`])} />
          </div>
        </Link>
        <Button
          label="view followers"
          variant="secondary"
          onClick={() => setUserFollowersDialog(true)}
        />
        <Button
          label="change password"
          variant="warning"
          onClick={() => (location.href = "/requestPasswordReset")}
        />
        <Button
          label="delete user"
          variant="danger"
          onClick={() => deleteUserMutation.mutate()}
        />
      </div>
    </div>
  );
}
