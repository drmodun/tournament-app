"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./addLFPForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFGRequest,
  ICreateLFPRequest,
  tournamentLocationEnum,
} from "@tournament-app/types";
import { UseMutationResult } from "@tanstack/react-query";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { FormProvider, useForm } from "react-hook-form";
import Input from "components/input";
import RichEditor from "components/richEditor";
import CheckboxGroup from "components/checkboxGroup";
import Dropdown from "components/dropdown";
import Button from "components/button";
import { useCreateLFP } from "api/client/hooks/lfp/useCreateLFP";
import { clsx } from "clsx";
import MultilineInput from "components/multilineInput";
import { useCreateLFG } from "api/client/hooks/lfg/useCreateLFG";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useGetCategoriesFilter } from "api/client/hooks/categories/useGetCategoriesFilter";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";

export default function AddLFGForm({ userId }: { userId?: number }) {
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
