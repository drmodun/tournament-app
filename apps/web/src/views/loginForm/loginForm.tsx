"use client";

import React from "react";
import styles from "./loginForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { TextVariants } from "types/styleTypes";
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

  //console.log(methods.watch("email"));

  return (
    <div className={styles.wrapper}>
      <h1 className={clsx(globals.titleText, styles.header)}>login</h1>
      <div className={styles.formWrapper}>
        <div>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className={styles.innerFormWrapper}
            >
              <div className={styles.inputWrapper}>
                <Input
                  variant={methods.formState.errors.email ? "danger" : variant}
                  label="email"
                  placeholder="enter your email address"
                  name="email"
                  required={true}
                  className={styles.input}
                  isReactFormHook={true}
                  reactFormHookProps={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "invalid email address",
                    },
                  }}
                />
                {methods.formState.errors.email?.type === "required" && (
                  <p className={styles.error}>this field is required!</p>
                )}
                {methods.formState.errors.email?.type === "pattern" && (
                  <p className={styles.error}>
                    {methods.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <Input
                  variant={
                    methods.formState.errors.password ? "danger" : variant
                  }
                  label="password"
                  placeholder="enter your password"
                  name="password"
                  required={true}
                  className={styles.input}
                  type="password"
                  isReactFormHook={true}
                  reactFormHookProps={{
                    pattern: {
                      value: /^(\S){4,32}$/gm,
                      message:
                        "password must be between 8 and 32 characters long",
                    },
                  }}
                />
                {methods.formState.errors.password?.type === "required" && (
                  <p className={styles.error}>this field is required!</p>
                )}
                {methods.formState.errors.password?.type === "pattern" && (
                  <p className={styles.error}>
                    {methods.formState.errors.password.message}
                  </p>
                )}
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
