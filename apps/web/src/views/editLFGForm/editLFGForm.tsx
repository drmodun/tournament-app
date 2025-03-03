"use client";

import { ILFGResponse, IUpdateLFGRequest } from "@tournament-app/types";
import { useGetUserInterests } from "api/client/hooks/interests/useGetUserInterests";
import { useUpdateLFG } from "api/client/hooks/lfg/useEditLFG";
import { clsx } from "clsx";
import Button from "components/button";
import CheckboxGroup from "components/checkboxGroup";
import MultilineInput from "components/multilineInput";
import ProgressWheel from "components/progressWheel";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import globals from "styles/globals.module.scss";
import { textColor } from "types/styleTypes";
import { useThemeContext } from "utils/hooks/useThemeContext";
import styles from "./editLFGForm.module.scss";

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
        ) : data?.results.length == 0 ? (
          <p className={globals[`${textColorTheme}Color`]}>
            you have no interests!
          </p>
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
