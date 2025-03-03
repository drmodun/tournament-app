"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./passwordReset.module.scss";
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

export default function PasswordReset({ token }: { token?: string }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [password, setPassword] = useState<string>();
  const [error, setError] = useState<string>();

  const resetPasswordMutation = useResetPassword(token);

  const handleClick = () => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,32}$/;
    if (!password?.match(re)) {
      setError(
        "password must contain at least 1 uppercase letter, 1 special character, 1 number and be at least 8 characters long",
      );
      return;
    }

    resetPasswordMutation.mutate(password);
  };

  return (
    <div>
      <h3 className={globals[`${textColorTheme}Color`]}>reset password</h3>
      <Input
        variant={textColorTheme}
        label="password"
        placeholder="enter new password..."
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className={styles.dangerColor}>{error}</p>}
      <Button label="change" variant="warning" onClick={handleClick} />
    </div>
  );
}
