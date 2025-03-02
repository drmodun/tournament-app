"use client";

// TODO: Actually implement

import { useEffect, useState } from "react";
import styles from "./addLFGForm.module.scss";
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
import { clsx } from "clsx";
import MultilineInput from "components/multilineInput";
import { useCreateLFG } from "api/client/hooks/lfg/useCreateLFG";
import { useGetCategories } from "api/client/hooks/categories/useGetCategories";
import { useGetCategoriesFilter } from "api/client/hooks/categories/useGetCategoriesFilter";
import { useGetCategoriesInfinite } from "api/client/hooks/categories/useGetCategoriesInfinite";
import ProgressWheel from "components/progressWheel";
import { useGetUserInterests } from "api/client/hooks/interests/useGetUserInterests";

export default function AddLFGForm() {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const createLFGMutation = useCreateLFG();
  const { data, isLoading } = useGetUserInterests();
  const [values, setValues] = useState<boolean[]>();

  useEffect(() => {
    setValues(
      data?.results.map((elem) => {
        return false;
      }) ?? [],
    );
  }, [data]);

  const returnIdsFromIndexes = () => {
    if (!values || !data?.results) return [];
    return data.results
      .map((elem, i) => {
        return values[i] ? elem.id : -1;
      })
      .filter((id) => id !== -1);
  };

  const methods = useForm<ICreateLFGRequest>();
  const onSubmit = (_data: ICreateLFGRequest) => {
    _data.categoryIds = returnIdsFromIndexes();
    createLFGMutation.mutate(_data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          add looking for groups campaign
        </h3>
        <MultilineInput
          variant={textColorTheme}
          placeholder="enter message, include your experience, requirements, and goals"
          isReactFormHook={true}
          name="message"
          required={true}
          className={styles.input}
          label="message"
          reactFormHookProps={{
            pattern: {
              value: /^.{10,}$/gm,
              message: "message length must be longer then or equal 10 ",
            },
          }}
        />
        {methods.formState.errors.message?.type === "required" && (
          <p className={styles.error}>this field is required!</p>
        )}
        {methods.formState.errors.message?.type === "pattern" && (
          <p className={clsx(styles.error, globals[`${textColorTheme}Color`])}>
            {methods.formState.errors.message.message}
          </p>
        )}
        <p className={clsx(globals.label, globals[`${textColorTheme}Color`])}>
          highlight your interests
        </p>
        {isLoading ? (
          <ProgressWheel variant={textColorTheme} />
        ) : (
          <CheckboxGroup
            name="interests"
            isReactHookForm={true}
            checkboxes={
              data?.results?.flatMap((elem) => {
                return {
                  label: `${elem.name} ${elem.type}`,
                  value: elem.id,
                  variant: textColorTheme,
                  labelVariant: textColorTheme,
                  onSelect: () => {
                    setValues(
                      (values ?? []).map((e, i) => {
                        return i === elem.id ? !e : e;
                      }),
                    );
                  },
                };
              }) ?? []
            }
          />
        )}

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
