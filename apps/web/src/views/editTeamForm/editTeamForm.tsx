"use client";

import { useEffect, useState } from "react";
import styles from "./editTeamForm.module.scss";
import globals from "styles/globals.module.scss";
import { clsx } from "clsx";
import Button from "components/button";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "components/input";
import Dropdown from "components/dropdown";
import SlideButton from "components/slideButton";
import CheckboxGroup from "components/checkboxGroup";
import {
  ICreateGroupRequest,
  IGroupMembershipResponse,
} from "@tournament-app/types";
import RichEditor from "components/richEditor";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import { COUNTRY_CODE, COUNTRY_CODES_TO_NAMES } from "utils/mixins/formatting";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { useCreateGroup } from "api/client/hooks/groups/useCreateGroup";
import { UseMutationResult } from "@tanstack/react-query";
import { useGetGroup } from "api/client/hooks/groups/useGetGroup";
import ProgressWheel from "components/progressWheel";
import { isError } from "lodash";
import { imageUrlToFile, toBase64 } from "utils/mixins/helpers";

type LocationType = "offline" | "online" | "hybrid";

type CreateTeamFormProps = {
  mutation: UseMutationResult<any, any, Partial<ICreateGroupRequest>, void>;
  groupId: number;
};

export default function CreateTeamForm({
  mutation,
  groupId,
}: CreateTeamFormProps) {
  const { theme } = useThemeContext();
  const { data, isLoading, isError } = useGetGroup(groupId);
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [placeId, setPlaceId] = useState<string>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();

  const editMethods = useForm<Partial<ICreateGroupRequest>>();
  const onEditSubmit: SubmitHandler<Partial<ICreateGroupRequest>> = (data) => {
    console.log(data);
    mutation.mutate(data);
  };

  const handleAutocomplete = (
    autocomplete: google.maps.places.Autocomplete,
  ) => {
    listener && google.maps.event.removeListener(listener);
    setPlaceId(autocomplete.getPlace().place_id);
  };

  useEffect(() => {
    editMethods.register("logo", { required: true });
    imageUrlToFile(data?.logo).then((file) => {
      setFile(file);
      toBase64(file).then((file) => {
        editMethods.setValue("logo", file);
      });
    });
  }, [data]);

  if (isLoading || isError) {
    return <ProgressWheel variant={textColorTheme} />;
  }

  return (
    <FormProvider {...editMethods}>
      <form
        onSubmit={editMethods.handleSubmit(onEditSubmit)}
        className={styles.form}
      >
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="group name"
            placeholder="enter group name"
            isReactFormHook={true}
            required={true}
            name="name"
            defaultValue={data?.name}
            reactFormHookProps={{
              pattern: {
                value: /^.{6,32}/i,
                message: "group name must be between 6 and 32 characters",
              },
            }}
          />
          {editMethods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {editMethods.formState.errors.name?.type === "pattern" && (
            <p className={styles.error}>
              {editMethods.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="group abbreviation"
            placeholder="enter group abbreviation"
            isReactFormHook={true}
            required={true}
            name="abbreviation"
            defaultValue={data?.abbreviation}
            reactFormHookProps={{
              pattern: {
                value: /^\S{2,6}/i,
                message:
                  "abbreviation must be between 3 and 5 characters without whitespaces",
              },
            }}
          />
          {editMethods.formState.errors.abbreviation?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {editMethods.formState.errors.abbreviation?.type === "pattern" && (
            <p className={styles.error}>
              {editMethods.formState.errors.abbreviation.message}
            </p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            group logo
          </p>
          {file ? (
            <div className={styles.imagePickerWrapper}>
              <ImagePicker
                file={file}
                name="logo"
                isReactFormHook={true}
                variant={textColorTheme}
                className={styles.imagePicker}
                required={true}
              />
              <Button
                variant="danger"
                label="remove"
                className={styles.removeLogoButton}
                onClick={() => {
                  setFile(undefined);
                  editMethods.setValue("logo", undefined);
                }}
              ></Button>
            </div>
          ) : (
            <ImageDrop
              onFile={setFile}
              variant={textColorTheme}
              className={styles.imageDrop}
              required={true}
              name="logo"
              isReactFormHook={true}
            />
          )}

          {editMethods.formState.errors.logo?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            description
          </p>
          <RichEditor
            name="description"
            isReactHookForm={true}
            variant={textColorTheme}
            required={true}
            startingContent={data?.description}
          />
          {editMethods.formState.errors.description?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            focus
          </p>
          <SlideButton
            options={["participation", "organization", "hybrid"]}
            isReactFormHook={true}
            name="focus"
            variant={textColorTheme}
            defaultValue={data?.focus}
          />
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            type
          </p>
          <SlideButton
            options={["private", "public"]}
            isReactFormHook={true}
            name="type"
            variant={textColorTheme}
            defaultValue={data?.type}
          />
        </div>
        <div className={styles.dialogOption}>
          <Dropdown
            options={countries.map((country: string) => {
              return {
                label:
                  COUNTRY_CODES_TO_NAMES[
                    (country as keyof typeof COUNTRY_CODES_TO_NAMES) ?? "ZZ"
                  ],
              };
            })}
            searchPlaceholder="search..."
            doesSearch={true}
            label="country"
            placeholder="select group country"
            name="country"
            isReactHookForm={true}
            required={true}
            variant={textColorTheme}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
            searchClassName={styles.dropdown}
            defaultValue={data?.country}
            style={{ width: "100%" }}
          />
          {editMethods.formState.errors.country?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="location"
            placeholder="enter your place of residence"
            name="location"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            defaultValue={data?.location}
            onChange={(e) => {
              setPlaceId(undefined);
              fetchAutocomplete(e.target).then((autocomplete) => {
                const tempListener = autocomplete.addListener(
                  "place_changed",
                  () => handleAutocomplete(autocomplete),
                );
                setListener(tempListener);
              });
            }}
          />

          {editMethods.formState.errors.location?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button variant={"primary"} submit={true} label="update competition" />
      </form>
    </FormProvider>
  );
}
