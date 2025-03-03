"use client";

import { ICreateUserRequest } from "@tournament-app/types";
import { useRegister } from "api/client/hooks/auth/useRegister";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateHTMLInput } from "utils/mixins/formatting";
import styles from "./registerForm.module.scss";

export default function RegisterForm() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const { mutateAsync } = useRegister();

  const methods = useForm<ICreateUserRequest>();
  const onSubmit: SubmitHandler<ICreateUserRequest> = async (data) => {
    data.country = data.country.split(" ")[0];
    console.log(data.profilePicture);
    await mutateAsync(data);
  };

  const [file, setFile] = useState<File>();

  return (
    <div className={styles.wrapper}>
      <h1
        className={clsx(
          globals.titleText,
          styles.header,
          styles[`${textColorTheme}Header`],
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
                      : textColorTheme
                  }
                  labelVariant={textColorTheme}
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
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
                {methods.formState.errors.username?.type === "pattern" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    {methods.formState.errors.username.message}
                  </p>
                )}
                <Input
                  variant={
                    methods.formState.errors.email ? "danger" : textColorTheme
                  }
                  label="email"
                  labelVariant={textColorTheme}
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
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
                {methods.formState.errors.email?.type === "pattern" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    {methods.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <Input
                  variant={
                    methods.formState.errors.password
                      ? "danger"
                      : textColorTheme
                  }
                  labelVariant={textColorTheme}
                  label="password"
                  placeholder="enter your password"
                  name="password"
                  required={true}
                  className={styles.input}
                  type="password"
                  isReactFormHook={true}
                  reactFormHookProps={{
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{8,32}$/,
                      message:
                        "password must contain at least 1 uppercase letter, 1 special character, 1 number and be at least 8 characters long",
                    },
                  }}
                />
                {methods.formState.errors.password?.type === "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
                {methods.formState.errors.password?.type === "pattern" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    {methods.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className={clsx(styles.inputWrapper)}>
                <Input
                  variant={
                    methods.formState.errors.name ? "danger" : textColorTheme
                  }
                  labelVariant={textColorTheme}
                  label="full name"
                  placeholder="enter your full name"
                  name="name"
                  required={true}
                  className={styles.input}
                  isReactFormHook={true}
                  reactFormHookProps={{
                    pattern: {
                      value: /(?![0-9])\w/i,
                      message: "full name must be a valid name!",
                    },
                  }}
                />

                {methods.formState.errors.name?.type === "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
                {methods.formState.errors.name?.type === "pattern" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    {methods.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className={clsx(styles.inputWrapper)}>
                <Dropdown
                  variant={
                    methods.formState.errors.country ? "danger" : textColorTheme
                  }
                  options={countries.map((country) => {
                    return {
                      label: `${country} ${getUnicodeFlagIcon(country)}`,
                    };
                  })}
                  searchPlaceholder="search..."
                  doesSearch={true}
                  labelVariant={textColorTheme}
                  label="nationality"
                  placeholder="select your nationality"
                  name="country"
                  isReactHookForm={true}
                  required={true}
                  className={styles.input}
                  innerWrapperClassName={styles.dropdown}
                  optionsClassName={styles.dropdown}
                  searchClassName={styles.dropdown}
                  style={{ width: "100%" }}
                />
                {methods.formState.errors.country?.type === "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <Input
                  variant={
                    methods.formState.errors.dateOfBirth
                      ? "danger"
                      : textColorTheme
                  }
                  labelVariant={textColorTheme}
                  label="date of birth"
                  placeholder="enter your date of birth"
                  name="dateOfBirth"
                  required={true}
                  className={styles.input}
                  type="date"
                  isReactFormHook={true}
                  min="1900-01-01"
                  max={formatDateHTMLInput(new Date())}
                />
                {methods.formState.errors.dateOfBirth?.type === "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
              </div>
              <div className={clsx(styles.inputWrapper)}>
                <p
                  className={clsx(
                    globals.label,
                    globals[`${textColorTheme}Color`],
                  )}
                >
                  bio
                </p>

                <div className={styles.input}>
                  <RichEditor
                    variant={textColorTheme}
                    name="bio"
                    isReactHookForm={true}
                    required={true}
                  />
                </div>

                {methods.formState.errors.bio?.type === "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
                  </p>
                )}
              </div>
              <div className={clsx(styles.inputWrapper)}>
                <p
                  className={clsx(
                    globals.label,
                    globals[`${textColorTheme}Color`],
                  )}
                >
                  profile picture
                </p>
                <div className={styles.input}>
                  {file ? (
                    <ImagePicker
                      variant={
                        methods.formState.errors.profilePicture
                          ? "danger"
                          : textColorTheme
                      }
                      file={file}
                      name="profilePicture"
                      isReactFormHook={true}
                      className={styles.imagePicker}
                      required={true}
                    />
                  ) : (
                    <ImageDrop
                      onFile={setFile}
                      variant={
                        methods.formState.errors.profilePicture
                          ? "danger"
                          : textColorTheme
                      }
                      className={styles.imageDrop}
                      required={true}
                      name="profilePicture"
                      isReactFormHook={true}
                    />
                  )}
                </div>
                {methods.formState.errors.profilePicture?.type ===
                  "required" && (
                  <p
                    className={clsx(
                      styles.error,
                      globals[`${textColorTheme}Color`],
                    )}
                  >
                    this field is required!
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
