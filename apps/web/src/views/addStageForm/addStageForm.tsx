"use client";

import {
  ICreateStageDto,
  stageTypeEnum,
  tournamentLocationEnum,
} from "@tournament-app/types";
import { useCreateLocation } from "api/client/hooks/locations/useCreateLocation";
import { useCreateStage } from "api/client/hooks/stages/useCreateStage";
import { fetchAutocomplete } from "api/googleMapsAPI/places";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./addStageForm.module.scss";

export default function AddStageForm({
  tournamentId,
  onClose,
}: {
  tournamentId?: number;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [locationId, setLocationId] = useState<number>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const createLocationMutation = useCreateLocation();
  const [logo, setLogo] = useState<string>();
  const mutation = useCreateStage();

  const addMethods = useForm<ICreateStageDto>();
  const onAddSubmit: SubmitHandler<ICreateStageDto> = async (data) => {
    data.locationId = locationId;
    if (logo) data.logo = logo;
    data.locationId = locationId;
    data.tournamentId = tournamentId ?? -1;
    data.minPlayersPerTeam = parseInt(String(data?.minPlayersPerTeam) || "0");
    data.maxPlayersPerTeam = parseInt(String(data?.maxPlayersPerTeam) || "0");

    await mutation.mutateAsync(data);
    onClose && onClose();
  };

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
            stage logo
          </p>
          {file ? (
            <ImagePicker
              file={file}
              name="logo"
              isReactFormHook={true}
              variant={textColorTheme}
              className={styles.imagePicker}
              required={false}
              onChange={setLogo}
            />
          ) : (
            <ImageDrop
              onFile={setFile}
              variant={textColorTheme}
              className={styles.imageDrop}
              required={false}
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
                fetchAutocomplete(e.target).then((autocomplete) => {
                  const tempListener = autocomplete.addListener(
                    "place_changed",
                    () => handleAutocomplete(autocomplete, e.target.value)
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
          <Dropdown
            options={[
              stageTypeEnum.GROUP,
              stageTypeEnum.KNOCKOUT,
              stageTypeEnum.SWISS,
              stageTypeEnum.ROUND_ROBIN,
              stageTypeEnum.DOUBLE_ELIMINATION,
              stageTypeEnum.TRIPLE_ELIMINATION,
            ].map((type) => ({
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
          label="create stage"
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
