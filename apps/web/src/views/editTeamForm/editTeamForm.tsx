"use client";

import { UseMutationResult } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { useDeleteGroup } from "api/client/hooks/groups/useDeleteGroup";
import { useGetGroup } from "api/client/hooks/groups/useGetGroup";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import ProgressWheel from "components/progressWheel";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { countries } from "country-flag-icons";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_CODES_TO_NAMES } from "utils/mixins/formatting";
import { imageUrlToFile, toBase64 } from "utils/mixins/helpers";
import styles from "./editTeamForm.module.scss";

type EditTeamFormProps = {
  mutation: UseMutationResult<any, any, Partial<ICreateGroupRequest>, void>;
  groupId: number;
  onClose?: () => void;
};

export default function EditTeamForm({
  mutation,
  groupId,
  onClose,
}: EditTeamFormProps) {
  const { theme } = useThemeContext();
  const { data, isLoading, isError } = useGetGroup(groupId);
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const [locationId, setLocationId] = useState<number>();
  const [logo, setLogo] = useState<string>();

  const deleteGroupMutation = useDeleteGroup();

  const editMethods = useForm<Partial<ICreateGroupRequest>>();
  const onEditSubmit: SubmitHandler<Partial<ICreateGroupRequest>> = async (
    data
  ) => {
    data.locationId = locationId;
    if (logo) data.logo = logo;
    await mutation.mutateAsync(data);
    onClose && onClose();
  };

  const createLocationMutation = useCreateLocation();

  const handleAutocomplete = async (
    autocomplete: google.maps.places.Autocomplete,
    placeName?: string
  ) => {
    listener && google.maps.event.removeListener(listener);

    const place = autocomplete.getPlace();

    if (!place.geometry?.location || !placeName || !place.place_id) return;

    const res = await createLocationMutation.mutateAsync({
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng(),
      name: placeName,
      apiId: place.place_id,
    });

    setLocationId(res.id);
  };

  useEffect(() => {
    editMethods.register("logo", { required: true });
    data?.logo &&
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
    data && (
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
            <p
              className={clsx(globals.label, globals[`${textColorTheme}Color`])}
            >
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
                  onChange={setLogo}
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
            <p
              className={clsx(globals.label, globals[`${textColorTheme}Color`])}
            >
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
            <p
              className={clsx(globals.label, globals[`${textColorTheme}Color`])}
            >
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
            <p
              className={clsx(globals.label, globals[`${textColorTheme}Color`])}
            >
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
              defaultValue={data?.location?.name}
              onChange={(e) => {
                fetchAutocomplete(e.target).then((autocomplete) => {
                  const tempListener = autocomplete.addListener(
                    "place_changed",
                    () => handleAutocomplete(autocomplete, e.target.value)
                  );
                  setListener(tempListener);
                });
              }}
            />

            {editMethods.formState.errors.locationId?.type === "required" && (
              <p className={styles.error}>this field is required!</p>
            )}
          </div>

          <Button variant={"warning"} submit={true} label="update team" />
          <Button
            label="delete team"
            variant="danger"
            className={styles.submitButton}
            submit={false}
            onClick={() => deleteGroupMutation.mutate(groupId)}
          />
        </form>
      </FormProvider>
    )
  );
}
