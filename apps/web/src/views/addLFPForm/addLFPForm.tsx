"use client";

import { ICreateLFPRequest } from "@tournament-app/types";
import { useCreateLFP } from "api/client/hooks/lfp/useCreateLFP";
import { clsx } from "clsx";
import Button from "components/button";
import MultilineInput from "components/multilineInput";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./addLFPForm.module.scss";

export default function AddLFPForm({ groupId }: { groupId?: number }) {
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
