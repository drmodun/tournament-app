"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./verifyUser.module.scss";
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

export default function VerifyUser({ token }: { token?: string }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const router = useRouter();

  const { data, isLoading, isSuccess, isError } = useVerifyUser(token);

  useEffect(() => {
    if (isError) setTimeout(() => router.push("/"), 2000);
    if (isSuccess) setTimeout(() => router.push("/login"), 2000);
  }, [isError, isSuccess]);

  return (
    <div>
      {isLoading ? (
        <ProgressWheel variant={textColorTheme} />
      ) : isSuccess ? (
        <p className={globals[`${textColorTheme}Color`]}>
          successfully verified user!
        </p>
      ) : (
        <p className={globals[`${textColorTheme}Color`]}>
          failed to verify user!
        </p>
      )}
    </div>
  );
}
