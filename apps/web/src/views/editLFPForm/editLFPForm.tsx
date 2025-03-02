"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./editLFPForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFPRequest,
  ILFPResponse,
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
import { useEditLFP } from "api/client/hooks/lfp/useEditLFP";

export default function EditLFPForm({ lfp }: { lfp?: ILFPResponse }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const editLFPMutation = useEditLFP();
  const methods = useForm<{ message: string }>();
  const onSubmit = (data: { message: string }) => {
    editLFPMutation.mutate({
      groupId: lfp?.groupId,
      id: lfp?.id,
      message: data.message,
    });
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          edit looking for players campaign
        </h3>
        <MultilineInput
          variant={textColorTheme}
          placeholder="enter message, include your requirements for a candidate"
          isReactFormHook={true}
          name="message"
          required={true}
          className={styles.input}
          defaultValue={lfp?.message}
        />
        {methods.formState.errors.message?.type === "required" && (
          <p className={styles.error}>this field is required!</p>
        )}

        <Button
          variant="warning"
          label="edit"
          className={styles.submitLfpButton}
          submit={true}
        />
      </form>
    </FormProvider>
  );
}
