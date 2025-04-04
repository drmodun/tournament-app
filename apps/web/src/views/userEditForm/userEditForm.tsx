"use client";

import { IExtendedUserResponse, IUpdateUserInfo } from "@tournament-app/types";
import { useUpdateUser } from "api/client/hooks/user/useUpdateUser";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import {
  COUNTRY_NAMES_TO_CODES,
  formatDateHTMLInput,
} from "utils/mixins/formatting";
import styles from "./userEditForm.module.scss";
import { imageUrlToFile } from "utils/mixins/helpers";

export default function userEditForm({
  data,
  onClose,
}: {
  data: IExtendedUserResponse | undefined;
  onClose?: () => void;
}) {
  const updateUser = useUpdateUser();

  const [file, setFile] = useState<File | string>();

  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const methods = useForm<IUpdateUserInfo>();
  const onSubmit: SubmitHandler<IUpdateUserInfo> = async (_data) => {
    if (!data) return;
    _data.country = _data.country?.split(" ")[0];
    await updateUser.mutateAsync(_data);

    onClose && onClose();
  };

  useEffect(() => {
    if (data?.profilePicture) {
      imageUrlToFile(data.profilePicture).then((f) => setFile(f));
    }
  }, [data]);

  const deleteProfilePicture = () => {
    setFile(undefined);
    methods.setValue("profilePicture", "");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>change username</h3>
          <Input
            label="new username"
            variant={textColorTheme}
            placeholder="enter new username"
            labelVariant={textColorTheme}
            defaultValue={data?.username}
            isReactFormHook={true}
            name="username"
          />
          {methods.formState.errors.username?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>
            change full name
          </h3>
          <Input
            label="new name"
            variant={textColorTheme}
            placeholder="enter new name"
            labelVariant={textColorTheme}
            defaultValue={data?.name}
            isReactFormHook={true}
            name="name"
          />
          {methods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>
            change profile picture
          </h3>
          <div className={styles.pfpEdit}>
            {file ? (
              <>
                <ImagePicker
                  file={file}
                  name="profilePicture"
                  isReactFormHook={true}
                  variant={textColorTheme}
                  className={styles.imagePicker}
                />
                <Button
                  variant="danger"
                  onClick={deleteProfilePicture}
                  label="delete photo"
                  className={styles.deletePhotoButton}
                />
              </>
            ) : (
              <ImageDrop
                onFile={setFile}
                variant={textColorTheme}
                className={styles.imageDrop}
              />
            )}
          </div>
        </div>

        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>change bio</h3>
          <RichEditor
            name="bio"
            isReactHookForm={true}
            editable={true}
            startingContent={data?.bio}
            variant={textColorTheme}
          />
          {methods.formState.errors.bio?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>
            change date of birth
          </h3>
          <Input
            variant={textColorTheme}
            label="new date of birth"
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
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <div className={styles.formItem}>
          <h3 className={globals[`${textColorTheme}Color`]}>
            change nationality
          </h3>
          <Dropdown
            variant={textColorTheme}
            label="new nationality"
            placeholder="enter your nationality"
            name="country"
            required={true}
            className={styles.input}
            doesSearch={true}
            searchPlaceholder="search..."
            isReactHookForm={true}
            defaultValue={`${COUNTRY_NAMES_TO_CODES[data?.country ?? ""] ?? data?.country} ${getUnicodeFlagIcon(data?.country ?? "ZZ")}`}
            options={countries.map((country) => {
              return {
                label: `${country} ${getUnicodeFlagIcon(country)}`,
              };
            })}
            style={{ width: "100%" }}
          />
          {methods.formState.errors.dateOfBirth?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.formItem}>
          <Button
            variant="warning"
            submit={true}
            label="update"
            className={styles.updateButton}
          />
        </div>
      </form>
    </FormProvider>
  );
}
