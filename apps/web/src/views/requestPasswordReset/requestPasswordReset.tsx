"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./requestPasswordReset.module.scss";
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

export default function RequestPasswordReset() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const requestPasswordResetMutation = useRequestPasswordReset();

  const { data } = useAuth();

  return (
    <div>
      <h3 className={globals[`${textColorTheme}Color`]}>
        send reset password request
      </h3>

      <Button
        label="send"
        variant="warning"
        onClick={() => requestPasswordResetMutation.mutate(data?.email)}
      />
    </div>
  );
}
