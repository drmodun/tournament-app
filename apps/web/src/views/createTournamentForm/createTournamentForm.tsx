"use client";

import { ICreateTournamentRequest } from "@tournament-app/types";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import { useCreateCompetition } from "api/client/hooks/competitions/useCreateCompetition";
import Button from "components/button";
import InfiniteDropdown from "components/infiniteDropdown";
import ProgressWheel from "components/progressWheel";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { useToastContext } from "utils/hooks/useToastContext";
import TournamentFormFields, {
  useTournamentFormState,
} from "views/tournamentFormFields";
import styles from "./createTournamentForm.module.scss";

export default function CreateTournamentForm({
  userId,
  onClose,
}: {
  userId: number;
  onClose?: () => void;
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);
  const {
    data,
    isLoading,
    isFetching: categoriesIsFetching,
    fetchNextPage: categoriesFetchNextPage,
  } = useGetCategoriesInfinite();
  const toast = useToastContext();
  const createCompetitionMutation = useCreateCompetition();
  const formState = useTournamentFormState();

  const categoryOptions = data?.pages?.flatMap((page) =>
    page.results.map((category) => ({
      label: category.name,
      id: category.id,
    })),
  );

  const methods = useForm<ICreateTournamentRequest>();
  const onSubmit: SubmitHandler<ICreateTournamentRequest> = async (data) => {
    if (data.startDate > data.endDate) {
      toast.addToast(
        "the starting time cannot be greater than then ending time",
        "error",
      );
      return;
    }

    formState.applyTo(data);
    data.creatorId = userId;

    // @ts-ignore
    if (!data.minimumMMR) data.minimumMMR = 0;
    // @ts-ignore
    if (!data.maximumMMR) data.maximumMMR = 10000;

    await createCompetitionMutation.mutateAsync(data);

    onClose && onClose();
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <TournamentFormFields
          styles={styles}
          state={formState}
          countryPlaceholder="select country"
        />
        <div className={styles.inputWrapper}>
          {isLoading ? (
            <ProgressWheel variant={textColorTheme} />
          ) : (
            <InfiniteDropdown
              isFetching={categoriesIsFetching}
              loadMore={async () => {
                await categoriesFetchNextPage();
              }}
              label="category"
              placeholder="select tournament category"
              name="categoryId"
              isReactHookForm={true}
              required={true}
              variant={textColorTheme}
              options={categoryOptions}
              onSelect={(index: number) =>
                formState.setCategoryId(categoryOptions?.[index].id ?? -1)
              }
            />
          )}
          {methods.formState.errors.categoryId?.type === "required" && (
            <p className={styles.error}>this field is required!</p>
          )}
        </div>

        <Button
          label="create competition"
          variant="primary"
          submit={true}
          className={styles.submitButton}
        />
      </form>
    </FormProvider>
  );
}
