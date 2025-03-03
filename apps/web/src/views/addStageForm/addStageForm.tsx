"use client";

import { useEffect, useState } from "react";
import styles from "./addStageForm.module.scss";
import globals from "styles/globals.module.scss";
import Navbar from "views/navbar";
import ManageUser from "views/manageUser";
import { clsx } from "clsx";
import Button from "components/button";
import ManageSettings from "views/manageSettings";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { textColor, TextVariants } from "types/styleTypes";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import Input from "components/input";
import Dropdown from "components/dropdown";
import SlideButton from "components/slideButton";
import CheckboxGroup from "components/checkboxGroup";
import {
  ICreateGroupRequest,
  ICreateStageDto,
  ILFPResponse,
  stageStatusEnum,
  stageTypeEnum,
  tournamentLocationEnum,
} from "@tournament-app/types";
import RichEditor from "components/richEditor";
import { countries } from "country-flag-icons";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import {
  COUNTRY_CODES_TO_NAMES,
  formatDateTimeHTMLInput,
} from "utils/mixins/formatting";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { useCreateGroup } from "api/client/hooks/groups/useCreateGroup";
import { UseMutationResult } from "@tanstack/react-query";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { useCreateStage } from "api/client/hooks/stages/useCreateStage";

type LocationType = "offline" | "online" | "hybrid";

export default function AddStageForm({
  tournamentId,
}: {
  tournamentId?: number;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [placeId, setPlaceId] = useState<string>();
  const [locationId, setLocationId] = useState<number>();
  const [finalLocationName, setFinalLocationName] = useState<string>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const createLocationMutation = useCreateLocation();
  const [logo, setLogo] = useState<string>();
  const mutation = useCreateStage();

  const addMethods = useForm<ICreateStageDto>();
  const onAddSubmit: SubmitHandler<ICreateStageDto> = (data) => {
    data.locationId = locationId;
    if (logo) data.logo = logo;
    data.locationId = locationId;
    data.tournamentId = tournamentId ?? -1;
    data.minPlayersPerTeam = parseInt(data?.minPlayersPerTeam ?? "0");
    data.maxPlayersPerTeam = parseInt(data?.maxPlayersPerTeam ?? "0");
    console.log(data);
    mutation.mutate(data);
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
    setFinalLocationName(placeName);
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
            label="stage name"
            placeholder="enter stage name"
            isReactFormHook={true}
            required={true}
            name="name"
            reactFormHookProps={{
              pattern: {
                value: /^.{6,32}/i,
                message: "stage name must be between 6 and 32 characters",
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
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            players per team
          </p>
          <div className={styles.playerBoundariesInputs}>
            <Input
              variant={textColorTheme}
              placeholder="enter minimum"
              isReactFormHook={true}
              required={true}
              name="minPlayersPerTeam"
              type="number"
              min="1"
            />
            <Input
              variant={textColorTheme}
              placeholder="enter maximum"
              isReactFormHook={true}
              required={true}
              name="maxPlayersPerTeam"
              type="number"
              min="1"
            />
          </div>
          {(addMethods.getValues("maxPlayersPerTeam") ?? Infinity) <
          (addMethods.getValues("minPlayersPerTeam") ?? 0) ? (
            <p className={styles.error}>invalid values!</p>
          ) : (
            (addMethods.formState.errors.minPlayersPerTeam?.type ===
              "required" ||
              addMethods.formState.errors.maxPlayersPerTeam?.type ===
                "required") && (
              <p className={styles.error}>this field is required!</p>
            )
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
            location type
          </p>
          <SlideButton
            options={[
              tournamentLocationEnum.ONSITE,
              tournamentLocationEnum.ONLINE,
              tournamentLocationEnum.HYBRID,
            ]}
            isReactFormHook={true}
            name="stageLocation"
            variant={textColorTheme}
          />
        </div>
        {addMethods.getValues("stageLocation") !==
          tournamentLocationEnum.ONLINE && (
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
        )}
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="starting time"
            placeholder="enter the stage's starting time"
            name="startDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
          {addMethods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="ending time"
            placeholder="enter the stage's ending time"
            name="endDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
          {addMethods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
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
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            status
          </p>
          <SlideButton
            options={[
              stageStatusEnum.UPCOMING,
              stageStatusEnum.ONGOING,
              stageStatusEnum.FINISHED,
              stageStatusEnum.CANCELLED,
            ]}
            isReactFormHook={true}
            name="stageStatus"
            variant={textColorTheme}
          />
        </div>
        <div className={styles.dialogOption}>
          <Dropdown
            options={Object.values(stageTypeEnum).map((type) => ({
              label: type,
            }))}
            searchPlaceholder="search..."
            doesSearch={true}
            label="stage type"
            placeholder="select stage type"
            required={true}
            variant={textColorTheme}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
            searchClassName={styles.dropdown}
            style={{ width: "100%" }}
            isReactHookForm={true}
            name="stageType"
          />
          {addMethods.formState.errors.stageType?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <Button
          variant={"primary"}
          submit={true}
          label="create competition"
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
