"use client";

// TODO: Actually implement

import { ILFPResponse } from "@tournament-app/types";
import { useEditLFP } from "api/client/hooks/lfp/useEditLFP";
import { clsx } from "clsx";
import Button from "components/button";
import MultilineInput from "components/multilineInput";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./editLFPForm.module.scss";

export default function EditLFPForm({
  lfp,
  onClose,
}: {
  lfp?: ILFPResponse;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const editLFPMutation = useEditLFP();
  const methods = useForm<{ message: string }>();
  const onSubmit = async (data: { message: string }) => {
    await editLFPMutation.mutateAsync({
      groupId: lfp?.groupId,
      id: lfp?.id,
      message: data.message,
    });
    if (editLFPMutation.isError == false) onClose && onClose();
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
