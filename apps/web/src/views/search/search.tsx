"use client";

import { useSearchGroups } from "api/client/hooks/groups/useSearchGroups";
import { useSearchUsers } from "api/client/hooks/user/useSearchUsers";
import { clsx } from "clsx";
import Input from "components/input";
import Link from "next/link";
import React, { useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import useDebounce from "utils/hooks/useDebounce";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./search.module.scss";
import { useSearchCompetitions } from "api/client/hooks/competitions/useSearchCompetitions";

export default function Search() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");
  const textColorTheme = textColor(theme);

  const { data: userData } = useSearchUsers(debouncedValue);
  const { data: groupData } = useSearchGroups(debouncedValue);
  const { data: tournamentData } = useSearchCompetitions(debouncedValue);

  const debouncedSetValue = useDebounce((value: string) => {
    setDebouncedValue(value);
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetValue(value);
  };

  return (
    <div className={styles.wrapper}>
      <Input
        onChange={handleInputChange}
        variant={textColorTheme}
        placeholder="search for a user, group or tournament..."
        className={styles.searchInput}
      />
      <div className={styles.scrollSection}>
        <h3 className={globals[`${textColorTheme}Color`]}>user results</h3>
        <div className={styles.usersSearch}>
          {!userData || userData.pages[0].length == 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>no results</p>
          ) : (
            userData?.pages?.map((page) => {
              return page?.map((result) => {
                return (
                  <Link
                    href={`/user/${result.id}`}
                    className={clsx(styles.link)}
                  >
                    <div
                      className={clsx(
                        globals[`${theme}Color`],
                        globals[`${textColorTheme}BackgroundColor`],
                        styles.userCard,
                      )}
                    >
                      <img
                        src={result.profilePicture}
                        alt="profile picture"
                        onError={(e) =>
                          (e.currentTarget.src = "/profilePicture.png")
                        }
                        className={styles.pfp}
                      />
                      <p>{result.username}</p>
                    </div>
                  </Link>
                );
              });
            })
          )}
        </div>
      </div>
      <div className={styles.scrollSection}>
        <h3 className={globals[`${textColorTheme}Color`]}>group results</h3>
        <div className={styles.usersSearch}>
          {!groupData || groupData.pages[0].length == 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>no results</p>
          ) : (
            groupData?.pages?.map((page) => {
              return page?.map((result) => {
                return (
                  <Link
                    href={`/group/${result.id}`}
                    className={clsx(styles.link)}
                  >
                    <div
                      className={clsx(
                        globals[`${theme}Color`],
                        globals[`${textColorTheme}BackgroundColor`],
                        styles.userCard,
                      )}
                    >
                      <img
                        src={result.logo}
                        alt="logo"
                        onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
                        className={styles.pfp}
                      />
                      <p>{result.name}</p>
                    </div>
                  </Link>
                );
              });
            })
          )}
        </div>
      </div>
      <div className={styles.scrollSection}>
        <h3 className={globals[`${textColorTheme}Color`]}>
          tournament results
        </h3>
        <div className={styles.usersSearch}>
          {!tournamentData || tournamentData.pages[0].length == 0 ? (
            <p className={globals[`${textColorTheme}Color`]}>no results</p>
          ) : (
            tournamentData?.pages?.map((page) => {
              return page?.map((result) => {
                return (
                  <Link
                    href={`/contest/${result.id}`}
                    className={clsx(styles.link)}
                  >
                    <div
                      className={clsx(
                        globals[`${theme}Color`],
                        globals[`${textColorTheme}BackgroundColor`],
                        styles.userCard,
                      )}
                    >
                      <img
                        src={result.logo}
                        onError={(e) => (e.currentTarget.src = "/noimg.jpg")}
                        className={styles.pfp}
                      />
                      <p>{result.name}</p>
                    </div>
                  </Link>
                );
              });
            })
          )}
        </div>
      </div>
    </div>
  );
}
