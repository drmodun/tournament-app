"use client";

import {
  IExtendedTournamentResponse,
  IUpdateTournamentRequest,
} from "@tournament-app/types";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useEditCompetition } from "api/client/hooks/competitions/useEditCompetition";
import Button from "components/button";
import Dropdown from "components/dropdown";
import ProgressWheel from "components/progressWheel";
import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import TournamentFormFields, {
  useTournamentFormState,
} from "views/tournamentFormFields";
import styles from "./editCompetitionForm.module.scss";

export default function EditCompetitionForm({
  competition,
  onClose,
}: {
  competition?: IExtendedTournamentResponse;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const { data, isLoading } = useGetCategories();
  const updateCompetitionMutation = useEditCompetition();
  const formState = useTournamentFormState();
  const { setLinks } = formState;

  const methods = useForm<IUpdateTournamentRequest>();
  const onSubmit: SubmitHandler<
    IUpdateTournamentRequest & { id?: number }
  > = async (data) => {
    formState.applyTo(data);
    data.country = data?.country ?? "Unknown";
    data.id = competition?.id;

    // @ts-ignore
    if (data.minimumMMR == "") data.minimumMMR = "0";
    // @ts-ignore
    if (data.maximumMMR == "") data.maximumMMR = "10000";

    await updateCompetitionMutation.mutateAsync(data);

    onClose && onClose();
  };

  useEffect(() => {
    setLinks(competition?.links?.split(",") ?? []);
  }, [competition, setLinks]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <TournamentFormFields
          styles={styles}
          state={formState}
          competition={competition}
          isEditing={true}
          countryPlaceholder="select tournament country"
        />
        <div className={styles.inputWrapper}>
          {isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            <Dropdown
              label="category"
              placeholder="select tournament category"
              name="categoryId"
              isReactHookForm={true}
              required={true}
              variant={textColorTheme}
              options={
                data?.results.map((category) => {
                  return { label: category.name };
                }) ?? []
              }
              onSelect={(index: number) =>
                formState.setCategoryId(data?.results[index].id ?? -1)
              }
              defaultValue={competition?.category?.name}
            />
          )}
          {methods.formState.errors.categoryId?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button
          label="edit competition"
          variant="warning"
          submit={true}
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
