"use client";

import { UseMutationResult } from "@tanstack/react-query";
import {
  IStageResponseWithTournament,
  IUpdateStageDto,
  stageStatusEnum,
  stageTypeEnum,
} from "@tournament-app/types";
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
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTimeHTMLInput } from "utils/mixins/formatting";
import { imageUrlToFile, toBase64 } from "utils/mixins/helpers";
import styles from "./editStageForm.module.scss";

type EditStageFormProps = {
  mutation: UseMutationResult<
    {
      id: number;
    },
    any,
    {
      data: IUpdateStageDto;
      stageId?: number;
    },
    void
  >;
  stage?: IStageResponseWithTournament;
  onClose?: () => void;
};

export default function EditStageForm({
  mutation,
  stage,
  onClose,
}: EditStageFormProps) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const [file, setFile] = useState<File>();
  const [listener, setListener] = useState<google.maps.MapsEventListener>();
  const [locationId, setLocationId] = useState<number>();

  const editMethods = useForm<IUpdateStageDto>();
  const onEditSubmit: SubmitHandler<IUpdateStageDto> = async (data) => {
    data.locationId = locationId;
    await mutation.mutateAsync({ data, stageId: stage?.id ?? -1 });

    onClose && onClose();
  };

  const createLocationMutation = useCreateLocation();

  const handleAutocomplete = async (
    autocomplete: google.maps.places.Autocomplete,
    placeName?: string,
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
    imageUrlToFile(stage?.logo).then((file) => {
      setFile(file);
      toBase64(file).then((file) => {
        editMethods.setValue("logo", file);
      });
    });
  }, [stage]);

  return (
    <FormProvider {...editMethods}>
      <form
        onSubmit={editMethods.handleSubmit(onEditSubmit)}
        className={styles.form}
      >
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="stage"
            placeholder="enter stage name"
            isReactFormHook={true}
            required={true}
            name="name"
            defaultValue={stage?.name}
            reactFormHookProps={{
              pattern: {
                value: /^.{6,32}/i,
                message: "stage name must be between 6 and 32 characters",
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
            startingContent={stage?.description}
          />
          {editMethods.formState.errors.description?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
            status
          </p>
          <SlideButton
            options={[
              stageStatusEnum.UPCOMING,
              stageStatusEnum.FINISHED,
              stageStatusEnum.ONGOING,
              stageStatusEnum.CANCELLED,
            ]}
            isReactFormHook={true}
            name="stageStatus"
            variant={textColorTheme}
            defaultValue={stage?.stageStatus}
          />
        </div>
        <div className={styles.dialogOption}>
          <Dropdown
            options={[
              { label: stageTypeEnum.KNOCKOUT },
              { label: stageTypeEnum.GROUP },
              { label: stageTypeEnum.DOUBLE_ELIMINATION },
              { label: stageTypeEnum.TRIPLE_ELIMINATION },
              { label: stageTypeEnum.ROUND_ROBIN },
              { label: stageTypeEnum.EVALUATED_COMPETITION },
              { label: stageTypeEnum.SWISS },
              { label: stageTypeEnum.COMPASS },
              { label: stageTypeEnum.FIXTURE },
            ]}
            searchPlaceholder="search..."
            defaultValue={stage?.stageType}
            doesSearch={true}
            label="type"
            placeholder="select stage type"
            name="stageType"
            isReactHookForm={true}
            required={true}
            variant={textColorTheme}
            className={styles.dropdown}
            innerWrapperClassName={styles.dropdown}
            optionsClassName={styles.dropdown}
            style={{ width: "100%" }}
            searchClassName={styles.search}
          />
        </div>

        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="starting time"
            placeholder="enter the tournament's starting time"
            name="startDate"
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            defaultValue={formatDateTimeHTMLInput(
              stage?.startDate ?? new Date(),
            )}
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
          {editMethods.formState.errors.startDate?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>
        <div className={styles.dialogOption}>
          <Input
            variant={textColorTheme}
            label="ending time"
            placeholder="enter the tournament's ending time"
            name="endDate"
            defaultValue={formatDateTimeHTMLInput(
              stage?.startDate ?? new Date(),
            )}
            required={true}
            className={styles.input}
            isReactFormHook={true}
            type="datetime-local"
            min={new Date()
              .toISOString()
              .slice(0, new Date().toISOString().lastIndexOf(":"))}
          />
          {editMethods.formState.errors.endDate?.type === "required" && (
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
            defaultValue={stage?.location?.name}
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

          {editMethods.formState.errors.locationId?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button variant={"warning"} submit={true} label="update competition" />
      </form>
    </FormProvider>
  );
}
