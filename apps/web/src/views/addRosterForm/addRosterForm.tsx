"use client";

import { useEffect, useState } from "react";
import styles from "./addRosterForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
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

export default function AddRosterForm({ groupId }: { groupId?: number }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const createLFPMutation = useCreateLFP();
  const methods = useForm<ICreateLFPRequest>();
  const onSubmit = (data: any) => {
    createLFPMutation.mutate({ groupId: groupId, message: data.message });
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          add looking for players campaign
        </h3>
        <MultilineInput
          variant={textColorTheme}
          placeholder="enter message, include your requirements for a candidate"
          isReactFormHook={true}
          name="message"
          required={true}
          className={styles.input}
        />
        {methods.formState.errors.message?.type === "required" && (
          <p className={styles.error}>this field is required!</p>
        )}

        <Button
          variant="primary"
          label="post"
          className={styles.submitLfpButton}
          submit={true}
        />
      </form>
    </FormProvider>
  );
}
