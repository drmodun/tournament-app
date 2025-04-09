"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCreateGroupJoinRequest } from "api/client/hooks/groups/useCreateGroupJoinRequest";
import { useGetLFPs } from "api/client/hooks/lfp/useGetLFPs";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Link from "next/link";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_NAMES_TO_CODES } from "utils/mixins/formatting";
import styles from "./browseLFPs.module.scss";

export default function BrowseLFPs() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [index, setIndex] = useState<number>(0);

  const { data, isLoading } = useGetLFPs();
  const createGroupJoinRequestMutation = useCreateGroupJoinRequest();

  if (!isLoading && data?.length == 0) {
    return;
  }

  return (
    <div
      className={clsx(
        styles.paginationWrapper,
        globals[`${textColorTheme}BackgroundColor`],
      )}
    >
      <button
        onClick={() => {
          setIndex((i) => i - 1);
        }}
        disabled={index == 0}
        className={styles.paginationButton}
      >
        <ArrowBackIcon className={clsx(globals[`${theme}FillChildren`])} />
      </button>
      {isLoading ? (
        <ProgressWheel variant={theme} />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.lfgWrapper}>
            <div className={clsx(styles.lfg, globals[`${theme}Color`])}>
              <Link
                href={`/group/${data && data[index]?.group.id}`}
                className={styles.link}
              >
                <div
                  className={clsx(
                    styles.userCard,
                    globals[`${theme}BackgroundColor`],
                    globals[`${textColorTheme}Color`],
                  )}
                >
                  <img
                    src={data[index]?.group.logo ?? "/profilePicture.png"}
                    onError={(e) =>
                      (e.currentTarget.src = "/profilePicture.png")
                    }
                    className={styles.profilePicture}
                  />
                  <div className={styles.userCardText}>
                    <p className={styles.name}>
                      {data && data[index]?.group.name}{" "}
                      <span className={styles.abbreviation}>
                        ({data && data[index]?.group.abbreviation})
                      </span>
                    </p>
                    <p>{data && data[index]?.group.memberCount} members</p>
                    <p>
                      {data &&
                        `${data[index]?.group.country} ${getUnicodeFlagIcon(COUNTRY_NAMES_TO_CODES[data[index]?.group.country ?? "ZZ"] ?? "ZZ") ?? ""}`}
                    </p>
                  </div>
                </div>
              </Link>
              <div className={styles.userInfo}>
                <div className={styles.bio}>
                  <p className={clsx(globals.label, globals[`${theme}Color`])}>
                    bio
                  </p>
                  <Markdown
                    className={globals[`${theme}Color`]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {data && data[index]?.group.description}
                  </Markdown>
                </div>
              </div>
              {/*
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
                                globals[`${theme}Color`],
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
                  */}
            </div>
          </div>
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              label="send group join invite"
              className={styles.actionButton}
              onClick={() =>
                data &&
                createGroupJoinRequestMutation.mutate({
                  groupId: data[index].group.id,
                  message: "i would like to join this group!",
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
        <ArrowForwardIcon className={clsx(globals[`${theme}FillChildren`])} />
      </button>
    </div>
  );
}
