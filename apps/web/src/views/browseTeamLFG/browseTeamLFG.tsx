"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCreateBlockedUser } from "api/client/hooks/blockedUsers/useCreateBlockedUser";
import { useCreateGroupInvite } from "api/client/hooks/groupInvites/useCreateGroupInvite";
import { useGetLFGTeam } from "api/client/hooks/lfg/useGetLFGTeam";
import { clsx } from "clsx";
import Button from "components/button";
import Chip from "components/chip";
import ProgressWheel from "components/progressWheel";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./browseTeamLFG.module.scss";

export default function BrowseTeamLFG({ groupId }: { groupId: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [index, setIndex] = useState<number>(0);

  const { data, isLoading } = useGetLFGTeam(groupId);
  const createGroupInviteMutation = useCreateGroupInvite();
  const createBlockedUserMutation = useCreateBlockedUser();

  return (
    <div className={styles.paginationWrapper}>
      <button
        onClick={() => {
          setIndex((i) => i - 1);
        }}
        disabled={index == 0}
        className={styles.paginationButton}
      >
        <ArrowBackIcon
          className={clsx(globals[`${textColorTheme}FillChildren`])}
        />
      </button>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.lfgWrapper}>
            <div
              className={clsx(styles.lfg, globals[`${textColorTheme}Color`])}
            >
              <div
                className={clsx(
                  styles.userCard,
                  globals[`${textColorTheme}BackgroundColor`],
                  globals[`${theme}Color`]
                )}
              >
                <img
                  src={
                    data[index]?.user.profilePicture ?? "/profilePicture.png"
                  }
                  onError={(e) => (e.currentTarget.src = "/profilePicture.png")}
                  className={styles.profilePicture}
                />
                <div className={styles.userCardText}>
                  <p className={styles.name}>
                    {data && data[index]?.user.name}
                  </p>
                  <p>{data && data[index]?.user.username}</p>
                  <p>{data && data[index]?.user.age.toString()}y</p>
                </div>
              </div>
              <div className={styles.userInfo}>
                <div className={styles.bio}>
                  <p
                    className={clsx(
                      globals.label,
                      globals[`${textColorTheme}Color`]
                    )}
                  >
                    bio
                  </p>
                  <Markdown
                    className={globals[`${textColorTheme}Color`]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {data && data[index]?.user.bio}
                  </Markdown>
                </div>
              </div>
              {data &&
                data[index]?.careers.length > 0 &&
                data[index]?.careers[0]?.category?.id !== undefined && (
                  <div className={styles.careers}>
                    <p className={styles.interests}>interests</p>
                    <div className={styles.careerWrapper}>
                      {data &&
                        data[index]?.careers.map((career) => (
                          <Chip
                            className={styles.careerChip}
                            variant={textColorTheme}
                          >
                            <div
                              className={clsx(
                                styles.careerCategory,
                                globals[`${theme}Color`]
                              )}
                            >
                              {career.category.name}
                            </div>
                            <Chip
                              label={`elo: ${career?.elo?.toString() ?? "0"}`}
                              variant="primary"
                            />
                          </Chip>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              label="send group join invite"
              className={styles.actionButton}
              onClick={() =>
                data &&
                createGroupInviteMutation.mutate({
                  userId: data[index].user.id,
                  groupId,
                  relatedLFGId: data[index].id,
                })
              }
            />
            <Button
              variant="danger"
              label="block user"
              className={styles.actionButton}
              onClick={() =>
                data &&
                createBlockedUserMutation.mutate({
                  userId: data[index].user.id,
                  groupId,
                })
              }
            />
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setIndex((i) => i + 1);
        }}
        disabled={index == (data?.length ?? 1) - 1}
        className={styles.paginationButton}
      >
        <ArrowForwardIcon
          className={clsx(globals[`${textColorTheme}FillChildren`])}
        />
      </button>
    </div>
  );
}
