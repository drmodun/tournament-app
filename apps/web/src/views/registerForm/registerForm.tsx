"use client";

import React from "react";
import styles from "./registerForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Button from "components/button";

type RegisterInputs = {
  username: "string";
  email: "string";
  password: "string";
};

export default function RegisterForm({
  variant = "light",
}: {
  variant?: TextVariants;
}) {
  const methods = useForm<RegisterInputs>();
  const onSubmit: SubmitHandler<RegisterInputs> = (data) => console.log(data);

  //console.log(methods.watch("email"));

  return (
    <div className={styles.wrapper}>
      <h1
        className={clsx(
          globals.titleText,
          styles.header,
          styles[`${textColor(variant)}Header`],
        )}
      >
        register
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
                  variant={
                    methods.formState.errors.username
                      ? "danger"
                      : textColor(variant)
                  }
                  label="username"
                  placeholder="enter your username"
                  name="username"
                  required={true}
                  className={styles.input}
                  isReactFormHook={true}
                  reactFormHookProps={{
                    pattern: {
                      value: /^(\S){4,32}$/gm,
                      message:
                        "username must be between 4 and 32 characters long and contain no whitespaces",
                    },
                  }}
                />
                {methods.formState.errors.username?.type === "required" && (
                  <p className={styles.error}>this field is required!</p>
                )}
                {methods.formState.errors.username?.type === "pattern" && (
                  <p className={styles.error}>
                    {methods.formState.errors.username.message}
                  </p>
                )}
                <Input
                  variant={
                    methods.formState.errors.email
                      ? "danger"
                      : textColor(variant)
                  }
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
                    methods.formState.errors.password
                      ? "danger"
                      : textColor(variant)
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
                      value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,32}$/,
                      message:
                        "password must contain at least 1 uppercase letter, 1 number and be at least 8 characters long",
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
                label="register"
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
