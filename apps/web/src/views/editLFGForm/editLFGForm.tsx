"use client";

import { useEffect, useState } from "react";
import styles from "./editLFGForm.module.scss";
import globals from "styles/globals.module.scss";
import { textColor, TextVariants } from "types/styleTypes";
import {
  ICreateGroupRequest,
  ICreateLFGRequest,
  ICreateLFPRequest,
  ILFGResponse,
  IUpdateLFGRequest,
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
import ProgressWheel from "components/progressWheel";
import { useGetUserInterests } from "api/client/hooks/interests/useGetUserInterests";
import { useUpdateLFG } from "api/client/hooks/lfg/useEditLFG";

export default function EditLFGForm({ lfg }: { lfg?: ILFGResponse }) {
  const { theme } = useThemeContext();
  const textColorTheme = textColor(theme);

  const editLFGMutation = useUpdateLFG();
  const { data, isLoading } = useGetUserInterests();
  const [values, setValues] = useState<boolean[]>();

  useEffect(() => {
    setValues(
      data?.results.map((elem) => {
        return lfg?.careers.some((e) => e.category.id == elem.id) ?? false;
      }) ?? [],
    );
  }, [data]);

  const returnIdsFromIndexes = () => {
    if (!values) return [];
    const arr: number[] = [];
    data?.results.map((elem, i) => {
      console.log(values[i], elem.id);
      if (values[i]) arr.push(elem.id);
    });
    return arr;
  };

  const methods = useForm<IUpdateLFGRequest & { id: number }>();
  const onSubmit = (_data: IUpdateLFGRequest & { id: number }) => {
    _data.categoryIds = returnIdsFromIndexes();
    _data.id = lfg?.id ?? -1;
    console.log(_data);
    editLFGMutation.mutate(_data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={styles.innerFormWrapper}
      >
        <h3 className={clsx(globals[`${textColorTheme}Color`], styles.title)}>
          edit looking for group campaign
        </h3>
        <MultilineInput
          variant={textColorTheme}
          placeholder="enter message, include your experience, requirements, and goals"
          isReactFormHook={true}
          name="message"
          required={true}
          className={styles.input}
          label="message"
          defaultValue={lfg?.message}
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
            defaultValues={data?.results.map((elem) => {
              return (
                lfg?.careers.some((e) => e.category.id == elem.id) ?? false
              );
            })}
            isReactHookForm={true}
            checkboxes={
              data?.results?.map((elem, i) => {
                return {
                  label: `${elem.name}`,
                  value: elem.id,
                  variant: textColorTheme,
                  labelVariant: textColorTheme,
                  onSelect: () => {
                    setValues((prev) => {
                      if (!prev) return [];
                      return prev.map((value, index) =>
                        index === i ? !value : value,
                      );
                    });
                  },
                };
              }) ?? []
            }
          />
        )}

        <Button
          variant="warning"
          label="change"
          className={styles.submitLfpButton}
          submit={true}
        />
      </form>
    </FormProvider>
  );
}
