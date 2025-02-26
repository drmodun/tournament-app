"use client";

import React from "react";
import styles from "./loginForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";
import { useLogin } from "api/client/hooks/auth/useLogin";

type LoginInputs = {
  email: "string";
  password: "string";
};

export default function LoginForm({
  variant = "light",
}: {
  variant?: TextVariants;
}) {
  const methods = useForm<LoginInputs>();
  const { mutateAsync } = useLogin();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) =>
    await mutateAsync(data);

  return (
    <div className={styles.wrapper}>
      <h1
        className={clsx(
          globals.titleText,
          styles.header,
          styles[`${textColor(variant)}Header`],
        )}
      >
        login
      </h1>
      <div className={styles.formWrapper}>
        <div>
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
        </div>
      </div>
    </div>
  );
}
