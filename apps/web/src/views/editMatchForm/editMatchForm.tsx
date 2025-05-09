"use client";

import { ILFPResponse } from "@tournament-app/types";
import { useEditLFP } from "api/client/hooks/lfp/useEditLFP";
import { clsx } from "clsx";
import Button from "components/button";
import MultilineInput from "components/multilineInput";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./editMatchForm.module.scss";
import { IMatchupResponseWithRosters } from "views/manageMatchups/manageMatchups";

export default function editMatchForm({
  match,
  onClose,
}: {
  match?: IMatchupResponseWithRosters;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const methods = useForm<>();

  const onSubmit = async (data) => {
    onClose && onClose();
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          edit match
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
