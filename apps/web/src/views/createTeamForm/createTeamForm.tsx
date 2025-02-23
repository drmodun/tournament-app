"use client";

import { useEffect, useState } from "react";
import styles from "./createTeamForm.module.scss";
import globals from "styles/globals.module.scss";
import Navbar from "views/navbar";
import ManageUser from "views/manageUser";
import { clsx } from "clsx";
import Button from "components/button";
import ManageSettings from "views/manageSettings";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor, TextVariants } from "types/styleTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ManageTeams from "views/manageTeams";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "api/client/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import Dialog from "components/dialog";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "components/input";
import Dropdown from "components/dropdown";
import SlideButton from "components/slideButton";
import CheckboxGroup from "components/checkboxGroup";
import {
  ICreateGroupRequest,
  tournamentLocationEnum,
} from "@tournament-app/types";
import RichEditor from "components/richEditor";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import { COUNTRY_CODES_TO_NAMES } from "utils/mixins/formatting";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { useCreateGroup } from "api/client/hooks/groups/useCreateGroup";
import { UseMutationResult } from "@tanstack/react-query";

type LocationType = "offline" | "online" | "hybrid";

export default function CreateTeamForm({
  mutation,
}: {
  mutation: UseMutationResult<any, any, ICreateGroupRequest, void>;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [placeId, setPlaceId] = useState<string>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();

  const addMethods = useForm<ICreateGroupRequest>();
  const onAddSubmit: SubmitHandler<ICreateGroupRequest> = (data) => {
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
                value: /^\S{6,32}$/i,
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
                label: COUNTRY_CODES_TO_NAMES[country],
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

          {addMethods.formState.errors.location?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button variant={"primary"} submit={true} label="create competition" />
      </form>
    </FormProvider>
  );
}
