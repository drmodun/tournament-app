"use client";

import React, { useEffect, useState } from "react";
import styles from "./search.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFGRequest,
  ICreateLFPRequest,
  tournamentLocationEnum,
} from "@tournament-app/types";
import { UseMutationResult } from "@tanstack/react-query";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { FormProvider, useForm } from "react-hook-form";
import Input from "components/input";
import RichEditor from "components/richEditor";
import CheckboxGroup from "components/checkboxGroup";
import Dropdown from "components/dropdown";
import Button from "components/button";
import { useCreateLFP } from "api/client/hooks/lfp/useCreateLFP";
import { clsx } from "clsx";
import MultilineInput from "components/multilineInput";
import { useCreateLFG } from "api/client/hooks/lfg/useCreateLFG";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useGetCategoriesFilter } from "api/client/hooks/categories/useGetCategoriesFilter";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import { useVerifyUser } from "api/client/hooks/auth/useVerifyUser";
import ProgressWheel from "components/progressWheel";
import { useRouter } from "next/navigation";
import { useResetPassword } from "api/client/hooks/auth/useResetPassword";
import { useToastContext } from "utils/hooks/useToastContext";
import { useRequestPasswordReset } from "api/client/hooks/auth/useRequestPasswordReset";
import { useAuth } from "api/client/hooks/auth/useAuth";
import useDebounce from "utils/hooks/useDebounce";
import { useSearchUsers } from "api/client/hooks/user/useSearchUsers";
import Link from "next/link";

export default function Search() {
  const { theme } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedValue, setDebouncedValue] = useState<string>("");
  const textColorTheme = textColor(theme);

  const { data: userData } = useSearchUsers(searchTerm);

  const debouncedSetValue = useDebounce((value: string) => {
    setDebouncedValue(value);
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetValue(value);
  };

  useEffect(() => {
    console.log(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

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
