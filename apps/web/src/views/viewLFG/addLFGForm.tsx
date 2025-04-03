"use client";

import { ICreateLFGRequest } from "@tournament-app/types";
import { useGetCategoriesFilter } from "api/client/hooks/categories/useGetCategoriesFilter";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import { useCreateLFG } from "api/client/hooks/lfg/useCreateLFG";
import { clsx } from "clsx";
import Button from "components/button";
import Dropdown from "components/dropdown";
import MultilineInput from "components/multilineInput";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./addLFPForm.module.scss";

export default function AddLFGForm() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const [name, setName] = useState<string>();

  const createLFGMutation = useCreateLFG();
  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    useGetCategoriesInfinite();
  const { data: searchData, isLoading: searchLoading } =
    useGetCategoriesFilter(name);

  const methods = useForm<ICreateLFGRequest>();
  const onSubmit = (data: ICreateLFGRequest) => {
    createLFGMutation.mutate(data);
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          add looking for players campaign
        </h3>
        <MultilineInput
          variant={textColorTheme}
          placeholder="enter message, include your experience, requirements, and goals"
          isReactFormHook={true}
          name="message"
          required={true}
          className={styles.input}
        />
        {methods.formState.errors.message?.type === "required" && (
          <p className={styles.error}>this field is required!</p>
        )}
        <Dropdown
          options={
            searchData?.pages[0]?.results?.length == 0
              ? data?.pages.flatMap((page) =>
                  page.results.flatMap((elem) => {
                    return { label: elem.name, id: elem.id };
                  }),
                )
              : searchData?.pages.flatMap((page) =>
                  page.results.flatMap((elem) => {
                    return { label: elem.name, id: elem.id };
                  }),
                )
          }
        />

        <Button
          variant="primary"
          label="post"
          className={styles.submitLfpButton}
          submit={true}
        />
      </form>
    </FormProvider>
  );
}
