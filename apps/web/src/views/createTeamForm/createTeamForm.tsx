"use client";

import { UseMutationResult } from "@tanstack/react-query";
import { ICreateGroupRequest } from "@tournament-app/types";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { countries } from "country-flag-icons";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { COUNTRY_CODES_TO_NAMES } from "utils/mixins/formatting";
import styles from "./createTeamForm.module.scss";

export default function CreateTeamForm({
  mutation,
  onClose,
}: {
  mutation: UseMutationResult<any, any, ICreateGroupRequest, void>;
  onClose: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [locationId, setLocationId] = useState<number>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const createLocationMutation = useCreateLocation();
  const [logo, setLogo] = useState<string>();

  const addMethods = useForm<ICreateGroupRequest>();
  const onAddSubmit: SubmitHandler<ICreateGroupRequest> = async (data) => {
    data.locationId = locationId;
    if (logo) data.logo = logo;
    console.log(data);
    await mutation.mutateAsync(data);
    if (mutation.isError == false) onClose && onClose();
  };

  const handleAutocomplete = async (
    autocomplete: google.maps.places.Autocomplete,
    placeName?: string,
  ) => {
    listener && google.maps.event.removeListener(listener);

    const place = autocomplete.getPlace();

    console.log(!place.geometry?.location, !placeName, !place.place_id);
    if (!place.geometry?.location || !placeName || !place.place_id) return;

    const res = await createLocationMutation.mutateAsync({
      lat: place.geometry?.location?.lat(),
      lng: place.geometry?.location?.lng(),
      name: placeName,
      apiId: place.place_id,
    });

    console.log(res);

    setLocationId(res.id);
  };

  useEffect(() => {
    addMethods.register("logo", { required: true });
  }, []);

  return (
    <FormProvider {...addMethods}>
      <form
        onSubmit={addMethods.handleSubmit(onAddSubmit)}
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
            reactFormHookProps={{
              pattern: {
                value: /^.{6,32}/i,
                message: "group name must be between 6 and 32 characters",
              },
            }}
          />
          {addMethods.formState.errors.name?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {addMethods.formState.errors.name?.type === "pattern" && (
            <p className={styles.error}>
              {addMethods.formState.errors.name.message}
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
            reactFormHookProps={{
              pattern: {
                value: /^([A-Za-zŽžÀ-ÿ]){2,6}\w$/i,
                message:
                  "abbreviation must be between 3 and 5 characters without whitespaces",
              },
            }}
          />
          {addMethods.formState.errors.abbreviation?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
          {addMethods.formState.errors.abbreviation?.type === "pattern" && (
            <p className={styles.error}>
              {addMethods.formState.errors.abbreviation.message}
            </p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            group logo
          </p>
          {file ? (
            <ImagePicker
              file={file}
              name="logo"
              isReactFormHook={true}
              variant={textColorTheme}
              className={styles.imagePicker}
              required={true}
              onChange={setLogo}
            />
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

          {addMethods.formState.errors.logo?.type === "required" && (
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
          />
          {addMethods.formState.errors.description?.type === "required" && (
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
          />
        </div>
        <div className={styles.dialogOption}>
          <Dropdown
            options={countries.map((country) => {
              return {
                label:
                  COUNTRY_CODES_TO_NAMES[
                    country as keyof typeof COUNTRY_CODES_TO_NAMES
                  ],
              };
            })}
            searchPlaceholder="search..."
            doesSearch={true}
            label="country"
            placeholder="select group country"
            required={true}
            variant={textColorTheme}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
            searchClassName={styles.dropdown}
            style={{ width: "100%" }}
          />
          {addMethods.formState.errors.country?.type === "required" && (
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
            onChange={(e) => {
              fetchAutocomplete(e.target).then((autocomplete) => {
                const tempListener = autocomplete.addListener(
                  "place_changed",
                  () => handleAutocomplete(autocomplete, e.target.value),
                );
                setListener(tempListener);
              });
            }}
          />
          {!locationId && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button variant={"primary"} submit={true} label="create competition" />
      </form>
    </FormProvider>
  );
}
