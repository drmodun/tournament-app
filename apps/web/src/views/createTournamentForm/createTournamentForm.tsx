"use client";

import React from "react";
import styles from "./createTournamentForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import { useLogin } from "api/client/hooks/auth/useLogin";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { ICreateTournamentRequest } from "@tournament-app/types";

export default function LoginForm() {
  const { theme } = useThemeContext();

  const methods = useForm<ICreateTournamentRequest>();
  const onSubmit: SubmitHandler<ICreateTournamentRequest> = async (data) =>
    console.log(data);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <div className={styles.inputWrapper}>
          <Input
            variant={textColor(variant)}
            label="email"
            placeholder="enter your email address"
            name="email"
            required={true}
            className={styles.input}
            isReactFormHook={true}
          />
        </div>
        <div className={styles.inputWrapper}>
          <Input
            variant={textColor(variant)}
            label="password"
            placeholder="enter your password"
            name="password"
            required={true}
            className={styles.input}
            type="password"
            isReactFormHook={true}
          />
        </div>
        <Button
          label="login"
          variant="primary"
          submit={true}
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
