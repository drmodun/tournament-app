"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ICreateLFGRequest } from "@tournament-app/types";
import { useGetPaginatedCategories } from "api/client/hooks/categories/useGetPaginatedCategories";
import { useCreateGroupInterests } from "api/client/hooks/interests/useCreateGroupInterests";
import { clsx } from "clsx";
import Button from "components/button";
import ProgressWheel from "components/progressWheel";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { InterestCard } from "views/manageInterests/manageInterests";
import styles from "./addGroupInterestsForm.module.scss";

export default function AddGroupInterestsForm({
  onClose,
  groupId,
  userInterestIds,
}: {
  onClose?: () => void;
  groupId?: number;
  userInterestIds?: number[];
}) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetchNextPageError,
    isFetchPreviousPageError,
  } = useGetPaginatedCategories();

  const [page, setPage] = useState<number>(0);
  const [fetchLimit, setFetchLimit] = useState<number>(-1);
  const [fetchLimitEffect, setFetchLimitEffect] = useState<number>(-1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const createGroupInterestMutation = useCreateGroupInterests(groupId);

  const methods = useForm<ICreateLFGRequest>();
  const onSubmit = async () => {
    await createGroupInterestMutation.mutateAsync(selectedIds);
    onClose && onClose();
  };

  const backward = async () => {
    if (page == 0) return;
    await fetchPreviousPage();

    setPage((curr) => curr - 1);
  };

  const forward = async () => {
    const nextPage = await fetchNextPage();

    setPage((curr) => curr + 1);

    if (
      isFetchNextPageError ||
      (nextPage.data?.pages[page + 1]?.results?.length ?? -1) < 10 ||
      !hasNextPage
    ) {
      setFetchLimit(page + 1);
      setPage((curr) => curr - 1);
      return;
    }
  };

  useEffect(() => {
    console.log(
      data?.pages?.[page]?.results?.length,
      data?.pages[page]?.results?.filter(
        (category) => !userInterestIds?.includes(category.id),
      ).length,
      userInterestIds?.length,
    );
    if (
      (data?.pages?.[page]?.results?.length ?? -1) > 0 &&
      data?.pages[page]?.results?.filter(
        (category) => !userInterestIds?.includes(category.id),
      ).length == 0 &&
      fetchLimitEffect <= 10
    ) {
      forward();
      setFetchLimitEffect((prev) => prev + 1);
    }
  }, [userInterestIds, data]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          add interests
        </h3>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : data?.pages[page]?.results?.filter(
            (category) => !userInterestIds?.includes(category.id),
          ).length == 0 ? (
          <div>
            <p className={globals[`${textColorTheme}Color`]}>
              you have no interests to add!
            </p>
          </div>
        ) : (
          <div className={styles.innerFormWrapper}>
            <div className={styles.paginationContainer}>
              <button
                onClick={backward}
                type="button"
                disabled={
                  page == 0 ||
                  isFetching ||
                  isFetchPreviousPageError ||
                  isFetchingPreviousPage
                }
                className={styles.paginationButton}
              >
                <ArrowBackIcon
                  className={clsx(globals[`${textColorTheme}FillChildren`])}
                />
              </button>
              <div className={styles.userCardWrapper}>
                {data?.pages[page]?.results
                  ?.filter(
                    (category) => !userInterestIds?.includes(category.id),
                  )
                  .map((category) => (
                    <div
                      onClick={() =>
                        setSelectedIds((prev) =>
                          selectedIds.includes(category.id)
                            ? prev.filter((e) => e != category.id)
                            : [...prev, category.id],
                        )
                      }
                    >
                      <InterestCard
                        className={styles.userCard}
                        interest={{
                          id: category.id,
                          image: category.logo,
                          type: category.type,
                          description: category.description,
                          name: category.name,
                        }}
                        variant={textColorTheme}
                        selected={selectedIds.includes(category.id)}
                        group={true}
                      />
                    </div>
                  ))}
              </div>

              <button
                onClick={forward}
                type="button"
                disabled={
                  page == fetchLimit ||
                  isFetching ||
                  isFetchNextPageError ||
                  isFetchingNextPage
                }
                className={styles.paginationButton}
              >
                <ArrowForwardIcon
                  className={clsx(globals[`${textColorTheme}FillChildren`])}
                />
              </button>
            </div>
            <div className={styles.selected}>
              <div>
                <h3 className={clsx(globals[`${textColorTheme}Color`])}>
                  selected interests
                </h3>
                <div className={styles.userCardWrapper}>
                  {selectedIds.length == 0 ? (
                    <div>
                      <p className={globals[`${textColorTheme}Color`]}>
                        you haven't selected any interests!
                      </p>
                    </div>
                  ) : (
                    selectedIds.map((id) => {
                      const category = data?.pages[page]?.results.find(
                        (category) => category.id == id,
                      );
                      return (
                        <InterestCard
                          className={styles.userCard}
                          interest={{
                            id: category?.id,
                            image: category?.logo,
                            type: category?.type,
                            description: category?.description,
                            name: category?.name,
                          }}
                          variant={textColorTheme}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className={styles.submitButton}>
              <Button
                label="add interests"
                variant="primary"
                disabled={isFetching || isLoading || selectedIds.length == 0}
                submit={true}
              />
            </div>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
