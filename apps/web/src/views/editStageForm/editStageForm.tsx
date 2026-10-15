"use client";

import { UseMutationResult } from "@tanstack/react-query";
import {
  IStageResponseWithTournament,
  IUpdateStageDto,
  stageStatusEnum,
  stageTypeEnum,
} from "@tournament-app/types";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ImageDrop from "components/imageDrop";
import ImagePicker from "components/imagePicker";
import Input from "components/input";
import LocationInput from "components/locationInput";
import RichEditor from "components/richEditor";
import SlideButton from "components/slideButton";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { formatDateTimeHTMLInput } from "utils/mixins/formatting";
import { imageUrlToFile, toBase64 } from "utils/mixins/helpers";
import styles from "styles/forms/editEntityForm.module.scss";
import { useLocationPicker } from "utils/hooks/useLocationPicker";

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
  const { locationId, selectPlace } = useLocationPicker();

  const editMethods = useForm<IUpdateStageDto>();
  const onEditSubmit: SubmitHandler<IUpdateStageDto> = async (data) => {
    data.locationId = locationId;
    await mutation.mutateAsync({ data, stageId: stage?.id ?? -1 });

    onClose && onClose();
  };

  useEffect(() => {
    editMethods.register("logo", { required: true });
    stage?.logo &&
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
            stage logo
          </p>
          {file ? (
            <div className={styles.imagePickerWrapper}>
              <ImagePicker
                file={file}
                name="logo"
                isReactFormHook={true}
                variant={textColorTheme}
                className={styles.imagePicker}
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
        {stage?.location && (
          <div className={styles.dialogOption}>
            <LocationInput
              variant={textColorTheme}
              label="location"
              placeholder="enter stage location"
              name="location"
              required={true}
              className={styles.input}
              isReactFormHook={true}
              defaultValue={stage?.location?.name}
              onSelect={selectPlace}
            />

            {editMethods.formState.errors.locationId?.type === "required" && (
              <p className={styles.error}>this field is required!</p>
            )}
          </div>
        )}

        <Button variant={"warning"} submit={true} label="update competition" />
      </form>
    </FormProvider>
  );
}
