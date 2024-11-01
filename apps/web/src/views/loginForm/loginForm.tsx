"use client";

import React from "react";
import styles from "./loginForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Input from "components/input";
import { TextVariants } from "types/styleTypes";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import Button from "components/button";

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
  const onSubmit: SubmitHandler<LoginInputs> = (data) => console.log(data);

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
                  variant={variant}
                  label="email"
                  placeholder="enter your email address"
                  name="email"
                  required={true}
                  className={styles.input}
                />
                {methods.formState.errors.email && (
                  <p className={styles.error}>this field is required!</p>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <Input
                  variant={variant}
                  label="password"
                  placeholder="enter your password"
                  name="password"
                  required={true}
                  className={styles.input}
                />
                {methods.formState.errors.password && (
                  <p className={styles.error}>this field is required!</p>
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
