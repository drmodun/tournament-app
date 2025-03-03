"use client";

import { useSearchUsers } from "api/client/hooks/user/useSearchUsers";
import { clsx } from "clsx";
import Input from "components/input";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import useDebounce from "utils/hooks/useDebounce";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./search.module.scss";

export default function Search() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");
  const textColorTheme = textColor(theme);

  const { data: userData } = useSearchUsers(debouncedValue);

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
      <div>
        <h3 className={globals[`${textColorTheme}Color`]}>user results</h3>
        <div className={styles.usersSearch}>
          {userData &&
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
            })}
        </div>
      </div>
    </div>
  );
}
